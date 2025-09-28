import { NextRequest, NextResponse } from 'next/server';

// Mock in-memory storage for demonstration
const mockSources = new Map([
  ['mangadx', { id: 1, key: 'mangadx', name: 'MangaDx', enabled: true }]
]);

const mockSeries = new Map();
const mockUserLibraries = new Map();
let nextSeriesId = 1;

// Mock connector function for testing
async function fetchSeriesMetadata(sourceSeriesId: string) {
  // Mock series metadata for testing
  return {
    title: `Test Series ${sourceSeriesId}`,
    description: `A test manga series with ID ${sourceSeriesId}`,
    primaryLanguage: 'en',
    coverUrl: 'https://via.placeholder.com/300x400?text=Test+Cover',
    tags: ['action', 'adventure', 'test']
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization header is required',
        code: 'MISSING_AUTHORIZATION' 
      }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    if (!userId) {
      return NextResponse.json({ 
        error: 'Valid authorization token is required',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const { source, sourceSeriesId } = requestBody;

    // Validate required fields
    if (!source) {
      return NextResponse.json({ 
        error: 'Source is required',
        code: 'MISSING_SOURCE' 
      }, { status: 400 });
    }

    if (source !== 'mangadx') {
      return NextResponse.json({ 
        error: 'Source must be "mangadx"',
        code: 'INVALID_SOURCE' 
      }, { status: 400 });
    }

    if (!sourceSeriesId) {
      return NextResponse.json({ 
        error: 'Source series ID is required',
        code: 'MISSING_SOURCE_SERIES_ID' 
      }, { status: 400 });
    }

    // Find source in mock storage
    const sourceData = mockSources.get(source);
    if (!sourceData) {
      return NextResponse.json({ 
        error: 'Source not found',
        code: 'SOURCE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Fetch series metadata using mock function
    let seriesMetadata;
    try {
      seriesMetadata = await fetchSeriesMetadata(sourceSeriesId);
    } catch (error) {
      console.error('Connector error:', error);
      return NextResponse.json({ 
        error: 'Series not found from external source',
        code: 'EXTERNAL_SERIES_NOT_FOUND' 
      }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Check if series already exists
    const existingSeriesKey = `${source}-${sourceSeriesId}`;
    let seriesRecord = mockSeries.get(existingSeriesKey);

    if (seriesRecord) {
      // Update existing series
      seriesRecord = {
        ...seriesRecord,
        ...seriesMetadata,
        updatedAt: now
      };
      mockSeries.set(existingSeriesKey, seriesRecord);
    } else {
      // Create new series
      seriesRecord = {
        id: nextSeriesId++,
        ...seriesMetadata,
        sourceId: sourceData.id,
        sourceSeriesId: sourceSeriesId,
        createdAt: now,
        updatedAt: now
      };
      mockSeries.set(existingSeriesKey, seriesRecord);
    }

    // Add to user library (idempotent)
    const libraryKey = `${userId}-${seriesRecord.id}`;
    if (!mockUserLibraries.has(libraryKey)) {
      mockUserLibraries.set(libraryKey, {
        userId: userId,
        seriesId: seriesRecord.id,
        createdAt: now
      });
    }

    return NextResponse.json({
      id: seriesRecord.id,
      title: seriesRecord.title,
      description: seriesRecord.description,
      primaryLanguage: seriesRecord.primaryLanguage,
      coverUrl: seriesRecord.coverUrl,
      tags: seriesRecord.tags,
      sourceId: sourceData.id,
      sourceSeriesId: sourceSeriesId,
      sourceName: sourceData.name,
      sourceKey: sourceData.key,
      inLibrary: true,
      userId: userId
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}