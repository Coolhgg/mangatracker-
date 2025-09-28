import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isCronAuthorized(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // if not set, allow (dev)
  const provided = req.headers.get("x-cron-secret") || req.headers.get("authorization");
  return !!provided && provided.replace(/^Bearer\s+/i, "").trim() === expected.trim();
}

export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Optional: pass through admin identity if available (use ADMIN_EMAIL as system user)
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-user-email": process.env.ADMIN_EMAIL || "admin@example.com",
    };

    // 1) Trigger source sync (all enabled)
    const syncRes = await fetch(`${base}/api/admin/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({ full: false }),
    });

    // 2) Reindex search
    const reindexRes = await fetch(`${base}/api/search/reindex`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const syncJson = await syncRes.json().catch(() => ({}));
    const reindexJson = await reindexRes.json().catch(() => ({}));

    return NextResponse.json({
      ok: true,
      sync: { status: syncRes.status, body: syncJson },
      reindex: { status: reindexRes.status, body: reindexJson },
      scheduled: true,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

// GET for easy cron ping
export const GET = POST;