import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// Expected body: { endpoint: string, keys?: { p256dh: string, auth: string }, userAgent?: string, userId?: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { endpoint, keys, userAgent, userId } = body || {};
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ ok: false, error: "Missing endpoint" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const values = {
      endpoint,
      p256dh: keys?.p256dh ?? null,
      auth: keys?.auth ?? null,
      userAgent: userAgent ?? req.headers.get("user-agent") ?? null,
      userId: typeof userId === "number" ? userId : null,
      createdAt: now,
      updatedAt: now,
    } as const;

    // Upsert by unique endpoint
    const result = await db
      .insert(pushSubscriptions)
      .values(values as any)
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          p256dh: values.p256dh as any,
          auth: values.auth as any,
          userAgent: values.userAgent as any,
          userId: values.userId as any,
          updatedAt: now as any,
        },
      })
      .returning({ id: pushSubscriptions.id });

    // Ensure we return the current row id even if updated
    const row = result?.[0];
    if (!row) {
      // Fallback: select by endpoint
      const existing = await db
        .select({ id: pushSubscriptions.id })
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));
      return NextResponse.json({ ok: true, id: existing?.[0]?.id ?? null, endpoint });
    }

    return NextResponse.json({ ok: true, id: row.id, endpoint });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}