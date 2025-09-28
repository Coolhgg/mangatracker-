import { NextRequest, NextResponse } from "next/server";
import { MangaDexConnector } from "@/lib/connectors/mangadex";

// GET /api/connectors/mangadex/series/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing series id" }, { status: 400 });

  try {
    const item = await MangaDexConnector.fetchSeriesMetadata(id);
    if (!item) return NextResponse.json({ error: "Series not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (e) {
    console.error("[mangadex series metadata] error:", e);
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 });
  }
}