import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mangaChapters as chaptersTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/chapters?seriesId=123&page=1&pageSize=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Default to 1 when missing per local test-data requirement
    const seriesId = searchParams.get("seriesId") || "1";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    const sid = Number(seriesId);
    if (Number.isNaN(sid)) {
      return NextResponse.json({ error: "seriesId must be a number" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(chaptersTable)
      .where(eq(chaptersTable.seriesId, sid))
      .orderBy(desc(chaptersTable.number))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return NextResponse.json({ items: rows, page, pageSize, seriesId: sid });
  } catch (err) {
    console.error("GET /api/chapters error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";