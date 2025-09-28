import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, series, mangaChapters, progress, library } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function authenticate(request: NextRequest) {
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

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ 
        error: 'Series slug is required',
        code: 'MISSING_SLUG' 
      }, { status: 400 });
    }

    // Find series by slug
    const seriesRecord = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesRecord.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesRecord[0].id;

    // Get user's library entry for this series
    const libraryRecord = await db.select()
      .from(library)
      .where(and(eq(library.userId, user.userId), eq(library.seriesId, seriesId)))
      .limit(1);

    // Get user's latest progress for this series
    const latestProgress = await db.select()
      .from(progress)
      .where(and(eq(progress.userId, user.userId), eq(progress.seriesId, seriesId)))
      .orderBy(desc(progress.updatedAt))
      .limit(1);

    // Construct response
    const response = {
      lastReadChapterId: libraryRecord.length > 0 ? libraryRecord[0].lastReadChapterId : null,
      lastReadAt: libraryRecord.length > 0 ? libraryRecord[0].lastReadAt : null,
      currentPage: latestProgress.length > 0 ? latestProgress[0].currentPage : null,
      completed: latestProgress.length > 0 ? latestProgress[0].completed : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET reading progress error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ 
        error: 'Series slug is required',
        code: 'MISSING_SLUG' 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { chapterId, currentPage, completed } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!chapterId || isNaN(parseInt(chapterId))) {
      return NextResponse.json({ 
        error: 'Valid chapterId is required',
        code: 'INVALID_CHAPTER_ID' 
      }, { status: 400 });
    }

    // Find series by slug
    const seriesRecord = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesRecord.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesRecord[0].id;

    // Validate chapter exists and belongs to series
    const chapterRecord = await db.select()
      .from(mangaChapters)
      .where(and(eq(mangaChapters.id, parseInt(chapterId)), eq(mangaChapters.seriesId, seriesId)))
      .limit(1);

    if (chapterRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Chapter not found or does not belong to this series',
        code: 'CHAPTER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Prepare progress data
    const progressData = {
      userId: user.userId,
      seriesId,
      chapterId: parseInt(chapterId),
      currentPage: currentPage !== undefined ? parseInt(currentPage) || 0 : 0,
      completed: completed !== undefined ? Boolean(completed) : false,
      updatedAt: new Date().toISOString()
    };

    // Upsert progress record
    const existingProgress = await db.select()
      .from(progress)
      .where(and(
        eq(progress.userId, user.userId),
        eq(progress.seriesId, seriesId),
        eq(progress.chapterId, parseInt(chapterId))
      ))
      .limit(1);

    let progressRecord;
    if (existingProgress.length > 0) {
      // Update existing progress
      progressRecord = await db.update(progress)
        .set({
          currentPage: progressData.currentPage,
          completed: progressData.completed,
          updatedAt: progressData.updatedAt
        })
        .where(and(
          eq(progress.userId, user.userId),
          eq(progress.seriesId, seriesId),
          eq(progress.chapterId, parseInt(chapterId))
        ))
        .returning();
    } else {
      // Insert new progress
      progressRecord = await db.insert(progress)
        .values(progressData)
        .returning();
    }

    // Update or create library entry if progress is meaningful (completed or currentPage > 0)
    if (progressData.completed || progressData.currentPage > 0) {
      const existingLibrary = await db.select()
        .from(library)
        .where(and(eq(library.userId, user.userId), eq(library.seriesId, seriesId)))
        .limit(1);

      const libraryData = {
        lastReadChapterId: parseInt(chapterId),
        lastReadAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingLibrary.length > 0) {
        // Update existing library entry
        await db.update(library)
          .set(libraryData)
          .where(and(eq(library.userId, user.userId), eq(library.seriesId, seriesId)));
      } else {
        // Create new library entry
        await db.insert(library)
          .values({
            userId: user.userId,
            seriesId,
            status: 'reading',
            ...libraryData,
            createdAt: new Date().toISOString()
          });
      }
    }

    return NextResponse.json({
      ok: true,
      progress: progressRecord[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST reading progress error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}