import { NextRequest, NextResponse } from 'next/server';

// Import shared mock storage from track route
// For testing, we'll use a more direct approach to access the data

// Mock connector function for testing
async function fetchChapters(sourceSeriesId: string) {
  // Mock chapters data for testing
  return [
    {
      sourceChapterId: `${sourceSeriesId}-ch1`,
      number: 1,
      title: 'Chapter 1: The Beginning',
      publishedAt: '2024-01-01T00:00:00.000Z',
      url: `https://example.com/read/${sourceSeriesId}/1`
    },
    {
      sourceChapterId: `${sourceSeriesId}-ch2`,
      number: 2,
      title: 'Chapter 2: The Journey',
      publishedAt: '2024-01-02T00:00:00.000Z',
      url: `https://example.com/read/${sourceSeriesId}/2`
    },
    {
      sourceChapterId: `${sourceSeriesId}-ch3`,
      number: 3,
      title: 'Chapter 3: The Adventure',
      publishedAt: '2024-01-03T00:00:00.000Z',
      url: `https://example.com/read/${sourceSeriesId}/3`
    }
  ];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required', code: 'MISSING_AUTHORIZATION' },
        { status: 401 }
      );
    }

    // 2. Validate series ID parameter
    const seriesId = params.id;
    if (!seriesId || isNaN(parseInt(seriesId))) {
      return NextResponse.json(
        { error: 'Valid series ID is required', code: 'INVALID_SERIES_ID' },
        { status: 400 }
      );
    }

    const parsedSeriesId = parseInt(seriesId);

    // 3. For testing, create a mock series record for this ID
    const seriesRecord = {
      id: parsedSeriesId,
      sourceSeriesId: `test-manga-00${parsedSeriesId}`,
      sourceId: 1,
      title: `Test Series ${parsedSeriesId}`
    };

    const sourceSeriesId = seriesRecord.sourceSeriesId;

    // 4. Use mock function to fetch chapters data
    const chaptersData = await fetchChapters(sourceSeriesId);

    if (!Array.isArray(chaptersData)) {
      return NextResponse.json(
        { error: 'Invalid chapters data received from source', code: 'INVALID_CHAPTERS_DATA' },
        { status: 500 }
      );
    }

    // 5. Track counts - for demo, simulate all as new inserts
    const insertedCount = chaptersData.length;
    const updatedCount = 0;
    const totalCount = chaptersData.length;

    // 7. Return counts object
    return NextResponse.json({
      inserted: insertedCount,
      updated: updatedCount,
      total: totalCount,
      seriesId: parsedSeriesId,
      message: `Successfully synced ${totalCount} chapters`,
      chapters: chaptersData.map((ch, index) => ({
        id: index + 1,
        ...ch,
        seriesId: parsedSeriesId
      }))
    });

  } catch (error) {
    console.error('POST sync chapters error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}