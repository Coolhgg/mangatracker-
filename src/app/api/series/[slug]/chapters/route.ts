import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db';
import { series, mangaChapters } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    // Find series by slug first
    const seriesRecord = await db.select({ 
      id: series.id, 
      title: series.title 
    }).from(series).where(eq(series.slug, slug)).limit(1);
    
    if (seriesRecord.length === 0) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const seriesId = seriesRecord[0].id;

    // Get chapters for this series with pagination
    const offset = (page - 1) * pageSize;
    const chaptersResult = await db.select({
      id: mangaChapters.id,
      number: mangaChapters.number,
      title: mangaChapters.title,
      language: mangaChapters.language,
      publishedAt: mangaChapters.publishedAt,
      pages: mangaChapters.pages,
      externalId: mangaChapters.externalId,
    })
    .from(mangaChapters)
    .where(eq(mangaChapters.seriesId, seriesId))
    .orderBy(asc(mangaChapters.number))
    .limit(pageSize + 1)
    .offset(offset);

    const hasMore = chaptersResult.length > pageSize;
    const items = chaptersResult.slice(0, pageSize).map(chapter => ({
      id: chapter.id,
      number: chapter.number,
      title: chapter.title || `Chapter ${chapter.number}`,
      language: chapter.language || 'en',
      publishedAt: chapter.publishedAt ? new Date(chapter.publishedAt).toISOString() : null,
      pages: chapter.pages || 0,
      url: chapter.externalId ? `https://mangadx.org/chapter/${chapter.externalId}` : `https://mangadx.org/chapter/${slug}-${chapter.number}`
    }));

    return NextResponse.json({ items, hasMore });

  } catch (error) {
    console.error("GET /api/series/[slug]/chapters error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}