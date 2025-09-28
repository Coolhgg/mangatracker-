import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { library, series, users, mangaChapters, readingProgress } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Authentication helper
async function authenticate(request: NextRequest) {
  // Try cookie-based session first
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      const userRecord = await db.select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
      
      if (userRecord.length > 0) {
        return { userId: userRecord[0].id };
      }
    }
  } catch (e) {
    // Cookie session failed, try bearer token
  }

  // Try Bearer token (numeric user ID)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const userId = parseInt(token);
    
    if (!isNaN(userId)) {
      const userRecord = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (userRecord.length > 0) {
        return { userId: userRecord[0].id };
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'MISSING_AUTHORIZATION' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24')));
    const statusFilter = searchParams.get('status');

    // Build library query with series join
    let query = db.select({
      id: library.id,
      userId: library.userId,
      seriesId: library.seriesId,
      status: library.status,
      rating: library.rating,
      notes: library.notes,
      updatedAt: library.updatedAt,
      // Series fields
      seriesSlug: series.slug,
      seriesTitle: series.title,
      seriesCoverUrl: series.coverImageUrl,
      seriesTags: series.tags
    }).from(library)
    .innerJoin(series, eq(library.seriesId, series.id))
    .where(eq(library.userId, authResult.userId));

    // Apply status filter
    if (statusFilter) {
      query = query.where(and(
        eq(library.userId, authResult.userId),
        eq(library.status, statusFilter)
      ));
    }

    // Order by most recently updated
    query = query.orderBy(desc(library.updatedAt));

    // Get total count
    let countQuery = db.select({ count: sql`count(*)` }).from(library)
      .where(eq(library.userId, authResult.userId));
    
    if (statusFilter) {
      countQuery = countQuery.where(and(
        eq(library.userId, authResult.userId),
        eq(library.status, statusFilter)
      ));
    }

    const totalResult = await countQuery;
    const total = Number(totalResult[0].count);

    // Apply pagination
    const offset = (page - 1) * limit;
    const libraryEntries = await query.limit(limit).offset(offset);

    // Get reading progress for each series
    const libraryWithProgress = await Promise.all(libraryEntries.map(async (entry) => {
      // Get reading progress count
      const progressCount = await db.select({ count: sql`count(*)` })
        .from(readingProgress)
        .where(and(
          eq(readingProgress.userId, authResult.userId),
          eq(readingProgress.seriesId, entry.seriesId)
        ));

      const readCount = Number(progressCount[0].count);

      // Get last read chapter info
      const lastReadProgress = await db.select({
        chapterId: readingProgress.chapterId,
        readAt: readingProgress.readAt
      })
      .from(readingProgress)
      .where(and(
        eq(readingProgress.userId, authResult.userId),
        eq(readingProgress.seriesId, entry.seriesId)
      ))
      .orderBy(desc(readingProgress.readAt))
      .limit(1);

      let lastReadChapter = null;
      if (lastReadProgress.length > 0) {
        const chapterInfo = await db.select({
          id: mangaChapters.id,
          number: mangaChapters.number,
          title: mangaChapters.title
        })
        .from(mangaChapters)
        .where(eq(mangaChapters.id, lastReadProgress[0].chapterId))
        .limit(1);

        if (chapterInfo.length > 0) {
          lastReadChapter = chapterInfo[0];
        }
      }

      return {
        id: entry.id,
        userId: entry.userId,
        seriesId: entry.seriesId,
        status: entry.status,
        rating: entry.rating || 0,
        notes: entry.notes || '',
        updatedAt: entry.updatedAt,
        series: {
          id: entry.seriesId,
          slug: entry.seriesSlug,
          title: entry.seriesTitle,
          coverImageUrl: entry.seriesCoverUrl || '',
          tags: Array.isArray(entry.seriesTags) ? entry.seriesTags : []
        },
        progress: {
          readCount,
          lastReadChapter
        }
      };
    }));

    return NextResponse.json({
      library: libraryWithProgress,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('GET /api/library error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'MISSING_AUTHORIZATION' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { seriesId, status, rating, notes } = body;

    // Validate required fields
    if (!seriesId || isNaN(parseInt(seriesId))) {
      return NextResponse.json({ 
        error: 'Valid seriesId is required',
        code: 'MISSING_SERIES_ID' 
      }, { status: 400 });
    }

    const parsedSeriesId = parseInt(seriesId);

    // Validate series exists
    const seriesExists = await db.select()
      .from(series)
      .where(eq(series.id, parsedSeriesId))
      .limit(1);

    if (seriesExists.length === 0) {
      return NextResponse.json({ 
        error: 'Series not found',
        code: 'SERIES_NOT_FOUND' 
      }, { status: 404 });
    }

    // Validate optional fields
    const validStatuses = ['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read'];
    const libraryStatus = status && validStatuses.includes(status) ? status : 'plan_to_read';

    if (rating !== undefined && (isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 10)) {
      return NextResponse.json({ 
        error: 'Rating must be between 0 and 10',
        code: 'INVALID_RATING' 
      }, { status: 400 });
    }

    // Check if already in library
    const existingEntry = await db.select()
      .from(library)
      .where(and(
        eq(library.userId, authResult.userId),
        eq(library.seriesId, parsedSeriesId)
      ))
      .limit(1);

    const now = new Date().toISOString();

    let result;
    if (existingEntry.length > 0) {
      // Update existing entry
      const updateData: any = {
        updatedAt: now
      };
      if (status) updateData.status = libraryStatus;
      if (rating !== undefined) updateData.rating = Number(rating);
      if (notes !== undefined) updateData.notes = notes || null;

      const updated = await db.update(library)
        .set(updateData)
        .where(and(
          eq(library.userId, authResult.userId),
          eq(library.seriesId, parsedSeriesId)
        ))
        .returning();

      result = updated[0];
    } else {
      // Create new entry
      const insertData = {
        userId: authResult.userId,
        seriesId: parsedSeriesId,
        status: libraryStatus,
        rating: rating !== undefined ? Number(rating) : 0,
        notes: notes || null,
        updatedAt: now
      };

      const created = await db.insert(library)
        .values(insertData)
        .returning();

      result = created[0];
    }

    // Return with series info
    const seriesInfo = seriesExists[0];
    return NextResponse.json({
      ...result,
      series: {
        id: seriesInfo.id,
        slug: seriesInfo.slug,
        title: seriesInfo.title,
        coverImageUrl: seriesInfo.coverImageUrl || '',
        tags: Array.isArray(seriesInfo.tags) ? seriesInfo.tags : []
      }
    }, { status: existingEntry.length > 0 ? 200 : 201 });

  } catch (error) {
    console.error('POST /api/library error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}