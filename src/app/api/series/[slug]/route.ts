import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { series } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// GET /api/series/[slug] - Get series details by slug
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const [seriesData] = await db
      .select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (!seriesData) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    // Format response to match expected structure
    return NextResponse.json({
      id: seriesData.id,
      slug: seriesData.slug,
      title: seriesData.title,
      description: seriesData.description,
      coverImageUrl: seriesData.coverImageUrl,
      tags: seriesData.tags,
      source: {
        name: seriesData.sourceName,
        url: seriesData.sourceUrl,
      },
      rating: seriesData.rating,
      year: seriesData.year,
      status: seriesData.status,
      createdAt: seriesData.createdAt,
      updatedAt: seriesData.updatedAt,
    });
  } catch (err) {
    console.error("GET /api/series/[slug] error:", err);
    const message = (err as any)?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}