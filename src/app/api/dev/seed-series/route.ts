import { NextResponse } from 'next/server';
import { seedRichSeriesData } from '@/db/seeds/rich-series-data';

export async function POST() {
  try {
    await seedRichSeriesData();
    return NextResponse.json({ 
      success: true, 
      message: "Successfully seeded 24 series to the database" 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}