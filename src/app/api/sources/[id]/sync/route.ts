import { NextRequest, NextResponse } from "next/server";

function parseId(param: string | null) {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Triggers a background sync for a given source id
// POST /api/sources/[id]/sync { full?: boolean }
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params?.id ?? null);
    if (!id) return NextResponse.json({ error: "Invalid source id" }, { status: 400 });

    const body = await request.json().catch(() => ({} as any));
    const full = Boolean(body?.full);

    // Phase-1: mock queueing (no worker). In production, enqueue a job and return job id/status.
    const payload = {
      id,
      action: "sync",
      full,
      status: "queued" as const,
      queuedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, job: payload });
  } catch (error: any) {
    console.error("POST /api/sources/[id]/sync error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

export const runtime = "nodejs";