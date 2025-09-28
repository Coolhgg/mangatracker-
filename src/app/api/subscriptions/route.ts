import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { withRateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";

// GET /api/subscriptions -> current user's subscription
export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    let userId: number | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        if (u.length) userId = u[0].id;
      }
    } catch {}
    if (!userId) {
      const h = req.headers.get("Authorization");
      if (h?.startsWith("Bearer ")) {
        const id = parseInt(h.slice(7));
        if (!Number.isNaN(id)) userId = id;
      }
    }
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const res = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    if (!res.length) {
      return NextResponse.json({ plan: "free", status: "inactive" }, { status: 200 });
    }
    return NextResponse.json(res[0]);
  } catch (e) {
    console.error("GET /api/subscriptions error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}, { key: "subscriptions:get", limit: 60, windowMs: 60_000 });

// PATCH /api/subscriptions { plan: "free" | "pro" | "premium" }
export const PATCH = withRateLimit(async (req: NextRequest) => {
  try {
    let userId: number | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        if (u.length) userId = u[0].id;
      }
    } catch {}
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = await req.json();
    const plan = String(body?.plan || "").toLowerCase();
    if (!plan || !["free", "pro", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Minimal stub: update local record only (billing handled separately)
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    if (existing.length) {
      const updated = await db.update(subscriptions)
        .set({ plan, status: plan === "free" ? "inactive" : "active" })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return NextResponse.json(updated[0]);
    } else {
      const created = await db.insert(subscriptions).values({ userId, plan, status: plan === "free" ? "inactive" : "active" }).returning();
      return NextResponse.json(created[0], { status: 201 });
    }
  } catch (e) {
    console.error("PATCH /api/subscriptions error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}, { key: "subscriptions:patch", limit: 20, windowMs: 60_000 });