import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, isNotNull } from "drizzle-orm";

export const runtime = "nodejs";

// Stub endpoint to simulate sending web push notifications
// POST body: { userId?: number, title?: string, body?: string, dryRun?: boolean, limit?: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, title, body: message, dryRun = true, limit = 25 } = body || {};

    // Dynamically import to avoid static export validation issues
    const mod: any = await import("@/db/schema");
    const pushSubscriptions = mod.pushSubscriptions;
    if (!pushSubscriptions) {
      return NextResponse.json({ ok: false, error: "pushSubscriptions table not available" }, { status: 500 });
    }

    // Fetch subscriptions (optionally filter by userId)
    let rows: any[] = [];
    try {
      if (typeof userId === "number") {
        rows = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
      } else {
        rows = await db.select().from(pushSubscriptions).where(isNotNull(pushSubscriptions.endpoint));
      }
    } catch (e: any) {
      // Gracefully handle missing table so stub still works
      if (typeof e?.message === "string" && e.message.includes("no such table: push_subscriptions")) {
        return NextResponse.json({
          ok: true,
          dryRun: !!dryRun,
          toSend: 0,
          totalSubscriptions: 0,
          tableMissing: true,
          preview: {
            title: title ?? "Test Notification",
            body: message ?? "Hello from stub",
          },
          sample: [],
        });
      }
      throw e;
    }

    const total = rows.length;
    const sample = rows
      .slice(0, Math.max(1, Math.min(100, Number(limit))))
      .map((r: any) => ({ id: r.id, userId: r.userId, endpoint: r.endpoint, ua: r.userAgent }));

    // This is a stub: we do not actually send push yet. Just report what would be sent.
    return NextResponse.json({
      ok: true,
      dryRun: !!dryRun,
      toSend: dryRun ? 0 : sample.length,
      totalSubscriptions: total,
      preview: {
        title: title ?? "Test Notification",
        body: message ?? "Hello from stub",
      },
      sample,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}