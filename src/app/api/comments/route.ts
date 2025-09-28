import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments as commentsTable, users, series as seriesTable, threads as threadsTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimitFromRequest, rateLimitRequest } from "@/lib/rate-limit";
import { sanitizeLen } from "@/lib/sanitize";
import { emitCommentEvent } from "@/lib/events";
import { z } from "zod";

// GET /api/comments?seriesId=123&threadId=456&page=1&pageSize=20
export async function GET(request: NextRequest) {
  // Per-IP lightweight RL
  const rl = rateLimitFromRequest(request, { windowMs: 10_000, max: 60 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const Query = z.object({
    seriesId: z.coerce.number().int().positive().optional(),
    threadId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
  });
  const parsed = Query.safeParse({
    seriesId: searchParams.get("seriesId") ?? undefined,
    threadId: searchParams.get("threadId") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { seriesId, threadId, page = 1, pageSize = 20 } = parsed.data;

  // Require at least one filter (seriesId or threadId)
  if (!seriesId && !threadId) {
    return NextResponse.json({ error: "seriesId or threadId is required" }, { status: 400 });
  }

  // If both are provided, ensure the thread belongs to the series
  if (seriesId && threadId) {
    const t = await db
      .select({ id: threadsTable.id, seriesId: threadsTable.seriesId })
      .from(threadsTable)
      .where(eq(threadsTable.id, threadId))
      .limit(1);
    if (!t.length) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    if (t[0].seriesId !== seriesId) {
      return NextResponse.json({ error: "Thread does not belong to series" }, { status: 400 });
    }
  }

  // Build where clause
  let where: any;
  if (threadId && seriesId) {
    where = and(eq(commentsTable.threadId, threadId), eq(commentsTable.seriesId, seriesId));
  } else if (threadId) {
    where = eq(commentsTable.threadId, threadId);
  } else {
    where = eq(commentsTable.seriesId, seriesId as number);
  }

  const rows = await db
    .select()
    .from(commentsTable)
    .where(where)
    .orderBy(desc(commentsTable.createdAt))
    .limit(pageSize + 1)
    .offset((page - 1) * pageSize);

  const hasMore = rows.length > pageSize;
  const items = rows.slice(0, pageSize).map((r: any) => ({
    id: r.id,
    userId: r.userId,
    content: r.content,
    threadId: r.threadId ?? null,
    createdAt: (() => {
      const v: any = r.createdAt;
      if (typeof v === "number") return new Date(v).toISOString();
      if (typeof v === "string") {
        const n = Number(v);
        if (!Number.isNaN(n)) return new Date(n).toISOString();
        const t = Date.parse(v);
        return Number.isNaN(t) ? v : new Date(t).toISOString();
      }
      try { return new Date(v).toISOString(); } catch { return String(v); }
    })(),
  }));

  return NextResponse.json({ items, hasMore });
}

// POST /api/comments  { seriesId, threadId?, parentId?, content }
export async function POST(request: NextRequest) {
  // Rate limit per IP
  const limited = await rateLimitRequest(request as unknown as Request, { key: "comments:create", limit: 10, windowMs: 60_000 });
  if (!limited.ok) return limited.response;

  // Auth
  let userId: number | null = null;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      const found = await db.select().from(users).where(eq(users.email, (session.user as any).email)).limit(1);
      if (found.length) userId = found[0].id;
    }
  } catch {}
  if (!userId) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const id = parseInt(authHeader.slice(7));
      if (!Number.isNaN(id)) userId = id;
    }
  }
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const Body = z.object({
    seriesId: z.coerce.number().int().positive(),
    threadId: z.coerce.number().int().positive().optional(),
    parentId: z.coerce.number().int().positive().optional(),
    content: z.string().min(1).max(2000),
  });
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { seriesId, threadId, parentId, content } = parsed.data;

  // Ensure series exists
  const s = await db
    .select({ id: seriesTable.id })
    .from(seriesTable)
    .where(eq(seriesTable.id, Number(seriesId)))
    .limit(1);
  if (!s.length) return NextResponse.json({ error: "Series not found" }, { status: 404 });

  // If threadId provided, ensure it exists and belongs to series
  if (threadId) {
    const t = await db
      .select({ id: threadsTable.id, seriesId: threadsTable.seriesId })
      .from(threadsTable)
      .where(eq(threadsTable.id, threadId))
      .limit(1);
    if (!t.length) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    if (t[0].seriesId !== seriesId) {
      return NextResponse.json({ error: "Thread does not belong to series" }, { status: 400 });
    }
  }

  const sanitized = sanitizeLen(content.trim(), 2000);
  if (!sanitized) return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
  const nowIso = new Date().toISOString();

  const inserted = await db
    .insert(commentsTable)
    .values({
      userId,
      seriesId: Number(seriesId),
      threadId: threadId ?? null,
      parentId: parentId ? Number(parentId) : null,
      content: sanitized,
      edited: false,
      deleted: false,
      flagsCount: 0,
      createdAt: nowIso,
    })
    .returning();

  const created = inserted[0];
  emitCommentEvent({ type: 'comment.created', payload: { comment: created } });
  return NextResponse.json(created, { status: 201 });
}

export const runtime = "nodejs";