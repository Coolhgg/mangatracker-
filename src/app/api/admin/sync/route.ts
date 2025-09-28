import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isAdmin(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const authEmail = req.headers.get("x-user-email")?.toLowerCase();
  // Lightweight admin guard: allow if caller provides matching x-user-email or if ADMIN_EMAIL not set (dev only)
  if (!adminEmail) return true;
  return adminEmail === authEmail;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sourceId = body?.sourceId as number | string | undefined;
    const full = Boolean(body?.full);

    // Pass through Authorization bearer if present for downstream routes
    const authHeader = req.headers.get("authorization") || undefined;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    };

    const actions: Array<{ id: string | number; ok: boolean; status: number }> = [];

    const triggerOne = async (id: string | number) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/sync/source/${id}/trigger`, {
        method: "POST",
        headers,
        body: JSON.stringify({ full }),
      });
      actions.push({ id, ok: res.ok, status: res.status });
    };

    if (sourceId) {
      await triggerOne(sourceId);
    } else {
      // Fetch sources and trigger all enabled
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/sources`, {
        headers,
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to list sources" }, { status: 502 });
      }
      const list = await res.json();
      const items: any[] = Array.isArray(list) ? list : list?.items || [];
      for (const s of items) {
        if (s?.enabled === false) continue;
        await triggerOne(s.id ?? s.ID ?? s.sourceId);
      }
    }

    return NextResponse.json({ ok: true, actions });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}