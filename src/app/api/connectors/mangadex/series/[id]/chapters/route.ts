import { NextRequest, NextResponse } from "next/server";
import { MangaDexConnector } from "@/lib/connectors/mangadex";

// GET /api/connectors/mangadex/series/[id]/chapters?page=1&limit=50
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sourceSeriesId = params.id;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);

  if (!sourceSeriesId) {
    return NextResponse.json({ error: "Missing series id" }, { status: 400 });
  }

  try {
    const chapters = await MangaDexConnector.fetchChapters(sourceSeriesId, { page, limit });
    return NextResponse.json({ chapters, page, limit, total: chapters.length, hasMore: chapters.length === limit });
  } catch (e) {
    console.error("[mangadex chapters] error:", e);
    return NextResponse.json({ chapters: [], page, limit, total: 0, hasMore: false }, { status: 200 });
  }
}