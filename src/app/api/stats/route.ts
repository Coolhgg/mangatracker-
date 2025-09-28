import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { library, readingHistory, series as seriesTable, users } from "@/db/schema";
import { and, desc, eq, gte, lt, inArray } from "drizzle-orm";

// Simple in-memory cache (TTL 60s)
const cache = new Map<string, { at: number; data: any }>();
const TTL_MS = 60 * 1000;

async function authenticate(request: NextRequest) {
  // Try cookie-based session first (lazy import to avoid module load errors)
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
      if (userRecord.length > 0) return { userId: userRecord[0].id };
    }
  } catch {}

  // Bearer fallback: numeric user id (skip DB lookup to avoid 500s when users table is missing)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const userId = parseInt(token);
    if (!isNaN(userId)) {
      return { userId };
    }
  }
  return null;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function getRangeDates(range: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  if (range === "weekly") {
    const from = new Date(todayStart);
    from.setDate(from.getDate() - 6); // include today => 7 days
    return { from, to: endOfDay(now) };
  }
  if (range === "monthly") {
    const from = new Date(todayStart);
    from.setDate(from.getDate() - 29); // last 30 days
    return { from, to: endOfDay(now) };
  }
  // all-time
  const from = new Date(0);
  return { from, to: endOfDay(now) };
}

export async function GET(request: NextRequest) {
  try {
    const authRes = await authenticate(request);
    if (!authRes) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") || "weekly").toLowerCase();
    const genre = (searchParams.get("genre") || "").toLowerCase().trim();

    const { from, to } = getRangeDates(range);

    // Cache key per user + params
    const key = `${authRes.userId}|${range}|${genre}`;
    const cached = cache.get(key);
    const nowMs = Date.now();
    if (cached && nowMs - cached.at < TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    // 1) Pull reading history for range (readAt stored as ms)
    let historyRows: Array<{ id: number; seriesId: number; readAt: number }> = [];
    try {
      historyRows = await db
        .select({
          id: readingHistory.id,
          seriesId: readingHistory.seriesId,
          readAt: readingHistory.readAt,
        })
        .from(readingHistory)
        .where(
          and(
            eq(readingHistory.userId, authRes.userId),
            gte(readingHistory.readAt, from.getTime()),
            lt(readingHistory.readAt, to.getTime())
          )
        )
        .orderBy(desc(readingHistory.readAt));
    } catch (e) {
      // Table missing or other DB error — fall back to empty history
      historyRows = [];
    }

    // 2) Build daily buckets (for 7 or 30 days) based on range
    const bucketCount = range === "weekly" ? 7 : range === "monthly" ? 30 : 30; // all-time -> last 30-day view for graph
    const buckets: { date: string; count: number }[] = [];
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date(endOfDay(from));
      d.setDate(d.getDate() + i);
      const keyDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
      buckets.push({ date: keyDate, count: 0 });
    }

    const bucketIndex = new Map<string, number>();
    buckets.forEach((b, idx) => bucketIndex.set(b.date, idx));

    for (const row of historyRows) {
      const d = new Date(row.readAt); // ms → Date
      const keyDate = startOfDay(d).toISOString().slice(0, 10);
      const idx = bucketIndex.get(keyDate);
      if (idx != null) buckets[idx].count += 1;
    }

    // 3) Determine available genres from user's library (joined with series.tags)
    let libRows: Array<{ seriesId: number; tags: string[] | null; slug: string | null; title: string | null }> = [];
    try {
      libRows = await db
        .select({
          seriesId: library.seriesId,
          tags: seriesTable.tags,
          slug: seriesTable.slug,
          title: seriesTable.title,
        })
        .from(library)
        .leftJoin(seriesTable, eq(library.seriesId, seriesTable.id))
        .where(eq(library.userId, authRes.userId));
    } catch (e) {
      libRows = [];
    }

    const genresMap = new Map<string, number>();
    for (const r of libRows) {
      const tags = Array.isArray(r.tags) ? r.tags : [];
      for (const t of tags) {
        const k = String(t).toLowerCase().trim();
        if (!k) continue;
        genresMap.set(k, (genresMap.get(k) || 0) + 1);
      }
    }
    const genres = Array.from(genresMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // 4) Optional filter by genre for the buckets using library membership
    let filteredSeriesIds: Set<number> | null = null;
    if (genre) {
      filteredSeriesIds = new Set<number>();
      for (const r of libRows) {
        const tags = Array.isArray(r.tags) ? r.tags : [];
        if (tags.map((t) => String(t).toLowerCase().trim()).includes(genre)) {
          filteredSeriesIds.add(r.seriesId as number);
        }
      }
    }

    const effectiveHistory = filteredSeriesIds
      ? historyRows.filter((h) => filteredSeriesIds!.has(h.seriesId as number))
      : historyRows;

    // Rebuild buckets if filtering is applied
    if (filteredSeriesIds) {
      buckets.forEach((b) => (b.count = 0));
      for (const row of effectiveHistory) {
        const d = new Date(row.readAt);
        const keyDate = startOfDay(d).toISOString().slice(0, 10);
        const idx = bucketIndex.get(keyDate);
        if (idx != null) buckets[idx].count += 1;
      }
    }

    // 5) Top series this month (calendar month) — tolerant to missing tables
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    let monthRows: Array<{ seriesId: number }> = [];
    try {
      monthRows = await db
        .select({ seriesId: readingHistory.seriesId })
        .from(readingHistory)
        .where(
          and(
            eq(readingHistory.userId, authRes.userId),
            gte(readingHistory.readAt, monthStart.getTime()),
            lt(readingHistory.readAt, nextMonthStart.getTime())
          )
        );
    } catch (e) {
      monthRows = [];
    }

    const monthCounts = new Map<number, number>();
    for (const r of monthRows) {
      const id = r.seriesId as number;
      if (filteredSeriesIds && !filteredSeriesIds.has(id)) continue;
      monthCounts.set(id, (monthCounts.get(id) || 0) + 1);
    }

    const topIds = Array.from(monthCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    let topSeries: Array<{ id: number; slug: string; title: string; count: number }> = [];
    if (topIds.length > 0) {
      try {
        const rows = await db
          .select({ id: seriesTable.id, slug: seriesTable.slug, title: seriesTable.title })
          .from(seriesTable)
          .where(inArray(seriesTable.id, topIds));
        topSeries = rows
          .map((r) => ({ id: r.id as number, slug: r.slug || "", title: r.title || "", count: monthCounts.get(r.id as number) || 0 }))
          .sort((a, b) => b.count - a.count);
      } catch (e) {
        topSeries = [];
      }
    }

    const payload = {
      range,
      from: from.toISOString(),
      to: to.toISOString(),
      buckets, // [{date: YYYY-MM-DD, count}]
      totalReads: effectiveHistory.length,
      genres, // [{name, count}]
      topSeriesThisMonth: topSeries,
    };

    cache.set(key, { at: nowMs, data: payload });
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}