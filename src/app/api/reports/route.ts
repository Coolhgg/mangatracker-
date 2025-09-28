import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminReports, users } from "@/db/schema";
import { and, desc, eq, isNotNull, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { withRateLimit } from "@/lib/api-guard";
import { z } from "zod";
import { rateLimitFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ReportStatus = z.enum(["open", "reviewing", "resolved", "rejected"]);
const CreateReportBody = z.object({
  status: ReportStatus.optional().default("open"),
  reason: z.string().min(1).max(500),
  seriesId: z.coerce.number().int().positive().optional(),
  commentId: z.coerce.number().int().positive().optional(),
  threadId: z.coerce.number().int().positive().optional(),
});

// POST /api/reports
export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    // auth via better-auth cookie or bearer
    let reporterUserId: number | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        const found = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);
        if (found.length) reporterUserId = found[0].id;
      }
    } catch {}
    if (!reporterUserId) {
      const h = req.headers.get("Authorization");
      if (h?.startsWith("Bearer ")) {
        const id = parseInt(h.slice(7));
        if (!Number.isNaN(id)) reporterUserId = id;
      }
    }
    if (!reporterUserId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const json = await req.json().catch(() => null);
    const parsed = CreateReportBody.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { status, reason, seriesId, commentId, threadId } = parsed.data;

    const now = new Date().toISOString();
    const inserted = await db
      .insert(adminReports)
      .values({
        status,
        reason,
        userId: reporterUserId,
        seriesId: seriesId ?? null,
        commentId: commentId ?? null,
        threadId: threadId ?? null,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (e) {
    console.error("POST /api/reports error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}, { key: "reports:create", limit: 20, windowMs: 60_000 });

// GET /api/reports?status=...&seriesId=...&commentId=...&threadId=...&type=series|comment|thread (admin only)
export async function GET(req: NextRequest) {
  try {
    // Lightweight per-IP RL for listing
    const rl = rateLimitFromRequest(req, { windowMs: 10_000, max: 60 });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // admin check via users.roles (array)
    const session = await auth.api.getSession({ headers: req.headers });
    let isAdmin = false;
    if (session?.user?.email) {
      const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
      if (u.length) {
        const roles = (u[0] as any).roles || [];
        isAdmin = roles?.includes?.("admin") || (u[0] as any).role === "admin";
      }
    }
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const Query = z.object({
      status: ReportStatus.optional(),
      seriesId: z.coerce.number().int().positive().optional(),
      commentId: z.coerce.number().int().positive().optional(),
      threadId: z.coerce.number().int().positive().optional(),
      type: z.enum(["series", "comment", "thread"]).optional(),
    });
    const parsed = Query.safeParse({
      status: searchParams.get("status") ?? undefined,
      seriesId: searchParams.get("seriesId") ?? undefined,
      commentId: searchParams.get("commentId") ?? undefined,
      threadId: searchParams.get("threadId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { status, seriesId, commentId, threadId, type } = parsed.data;

    const whereParts: any[] = [];
    if (status) whereParts.push(eq(adminReports.status, status));
    if (seriesId) whereParts.push(eq(adminReports.seriesId, seriesId));
    if (commentId) whereParts.push(eq(adminReports.commentId, commentId));
    if (threadId) whereParts.push(eq(adminReports.threadId, threadId));
    if (type === "series") whereParts.push(and(isNotNull(adminReports.seriesId)));
    if (type === "comment") whereParts.push(and(isNotNull(adminReports.commentId)));
    if (type === "thread") whereParts.push(and(isNotNull(adminReports.threadId)));

    const whereExpr = whereParts.length ? (whereParts.length === 1 ? whereParts[0] : and(...whereParts)) : undefined as any;

    const rows = await db
      .select()
      .from(adminReports)
      .where(whereExpr)
      .orderBy(desc(adminReports.createdAt));

    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error("GET /api/reports error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/reports  { id, status }
export const PATCH = withRateLimit(async (req: NextRequest) => {
  try {
    // admin check via users.roles (array)
    const session = await auth.api.getSession({ headers: req.headers });
    let isAdmin = false;
    let adminEmail: string | null = null;
    if (session?.user?.email) {
      const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
      if (u.length) {
        const roles = (u[0] as any).roles || [];
        isAdmin = roles?.includes?.("admin") || (u[0] as any).role === "admin";
        adminEmail = session.user.email;
      }
    }
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const Body = z.object({
      id: z.coerce.number().int().positive(),
      status: ReportStatus,
    });
    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { id, status } = parsed.data;
    const [existing] = await db.select().from(adminReports).where(eq(adminReports.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const updated = await db
      .update(adminReports)
      .set({ status })
      .where(eq(adminReports.id, id))
      .returning();

    return NextResponse.json({ ok: true, report: updated[0] });
  } catch (e) {
    console.error("PATCH /api/reports error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}, { key: "reports:update", limit: 60, windowMs: 60_000 });