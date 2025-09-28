import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitFromRequest } from "@/lib/rate-limit";
import { sanitizeLen } from "@/lib/sanitize";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { threads, series as seriesTable } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

const ListQuery = z.object({
  seriesId: z.coerce.number().int().positive().optional(),
  slug: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

const CreateBody = z.object({
  seriesId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(200),
});

export async function GET(req: NextRequest) {
  // Rate limit per IP
  const rl = rateLimitFromRequest(req, { windowMs: 10_000, max: 30 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = ListQuery.safeParse({
    seriesId: url.searchParams.get("seriesId") ?? undefined,
    slug: url.searchParams.get("slug") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  let { seriesId, slug, page = 1, pageSize = 20 } = parsed.data;

  // Convenience: allow ?slug=... to resolve seriesId
  if (!seriesId && slug) {
    const s = await db
      .select({ id: seriesTable.id })
      .from(seriesTable)
      .where(eq(seriesTable.slug, slug))
      .limit(1);
    if (!s[0]) {
      return NextResponse.json({ error: "Series not found for provided slug" }, { status: 404 });
    }
    seriesId = s[0].id;
  }

  if (!seriesId) {
    return NextResponse.json({ error: "seriesId or slug is required" }, { status: 400 });
  }

  const offset = (page - 1) * pageSize;

  const [data, totalRow] = await Promise.all([
    db
      .select({
        id: threads.id,
        seriesId: threads.seriesId,
        title: threads.title,
        pinned: threads.pinned,
        createdBy: threads.createdBy,
        createdAt: threads.createdAt,
        updatedAt: threads.updatedAt,
      })
      .from(threads)
      .where(eq(threads.seriesId, seriesId))
      .orderBy(desc(threads.pinned), desc(threads.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(threads)
      .where(eq(threads.seriesId, seriesId))
      .then((rows) => rows[0]),
  ]);

  const total = Number(totalRow?.count || 0);
  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  // Auth required
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Rate limit per user
  const rl = rateLimitFromRequest(req, { windowMs: 60_000, max: 20 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { seriesId, title } = parsed.data;
  const cleanTitle = sanitizeLen(title, 200);

  // Reject if sanitization results in an empty title
  if (!cleanTitle) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  // Ensure series exists
  const s = await db
    .select({ id: seriesTable.id })
    .from(seriesTable)
    .where(eq(seriesTable.id, seriesId))
    .limit(1);
  if (!s[0]) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  // Ensure numeric user id for required createdBy field
  const createdBy = Number((session.user as any).id);
  if (Number.isNaN(createdBy)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const created = await db
    .insert(threads)
    .values({ seriesId, title: cleanTitle, createdBy, pinned: false, createdAt: now, updatedAt: now })
    .returning({ id: threads.id, seriesId: threads.seriesId, title: threads.title, pinned: threads.pinned, createdBy: threads.createdBy, createdAt: threads.createdAt });

  return NextResponse.json(created[0], { status: 201 });
}