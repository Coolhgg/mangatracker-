import { NextRequest, NextResponse } from "next/server";

// Simple zod-like guards without adding deps
function parseId(param: string | null) {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params?.id ?? null);
    if (!id) return NextResponse.json({ error: "Invalid source id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const trustScore = typeof body?.trustScore === "number" ? body.trustScore : null;
    if (trustScore === null || trustScore < 0 || trustScore > 100) {
      return NextResponse.json({ error: "trustScore must be a number between 0 and 100" }, { status: 422 });
    }

    // Phase-1: mock persistence (no DB yet). In production, update the sources table.
    const updated = {
      id,
      trustScore,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, source: updated });
  } catch (error: any) {
    console.error("PATCH /api/sources/[id]/trust error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

export const runtime = "nodejs";