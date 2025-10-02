import { NextResponse } from "next/server";
import { db } from '@/db';
import { series } from '@/db/schema';
import { like, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all series
    const allSeries = await db.select().from(series).limit(5);
    
    // Try search with "solo"
    const searchTerm = "%solo%";
    const searchResults = await db.select()
      .from(series)
      .where(like(sql`lower(${series.title})`, searchTerm))
      .limit(5);
    
    // Try search with exact title
    const exactSearch = await db.select()
      .from(series)
      .where(like(series.title, "%Solo%"))
      .limit(5);
    
    return NextResponse.json({
      totalSeries: allSeries.length,
      allSeries: allSeries.map(s => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        titleLength: s.title?.length || 0,
        titleBytes: Buffer.from(s.title || '').toString('hex')
      })),
      searchWithLowerSolo: searchResults.map(s => ({ id: s.id, title: s.title })),
      searchWithSolo: exactSearch.map(s => ({ id: s.id, title: s.title })),
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}