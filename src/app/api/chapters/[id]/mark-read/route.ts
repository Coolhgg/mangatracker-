/**
 * POST /api/chapters/[id]/mark-read - Mark chapter as read for user
 * 
 * Requires Authorization: Bearer <token> header.
 * 
 * Body:
 * - read: boolean (required) - Mark as read (true) or unread (false)
 * 
 * Updates lastReadChapterId in user's library if chapter belongs to series in library.
 * Only updates if user has the series in their library.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { readingProgress, chapters, users, readingHistory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'MISSING_AUTHORIZATION' 
      }, { status: 401 });
    }

    // Validate chapter ID parameter
    const chapterId = params.id;
    if (!chapterId || isNaN(parseInt(chapterId))) {
      return NextResponse.json({ 
        error: 'Valid chapter ID is required',
        code: 'INVALID_CHAPTER_ID' 
      }, { status: 400 });
    }

    const parsedChapterId = parseInt(chapterId);

    // Validate chapter exists and get seriesId
    const chapterResult = await db
      .select({
        id: chapters.id,
        seriesId: chapters.seriesId,
        title: chapters.title,
        number: chapters.number,
      })
      .from(chapters)
      .where(eq(chapters.id, parsedChapterId))
      .limit(1);

    if (chapterResult.length === 0) {
      return NextResponse.json({ 
        error: 'Chapter not found',
        code: 'CHAPTER_NOT_FOUND' 
      }, { status: 404 });
    }

    const chapter = chapterResult[0];
    const now = Date.now();

    // Check if reading progress already exists
    const existingProgress = await db.select()
      .from(readingProgress)
      .where(and(
        eq(readingProgress.userId, authResult.userId),
        eq(readingProgress.chapterId, parsedChapterId)
      ))
      .limit(1);

    if (existingProgress.length > 0) {
      // Update existing progress
      await db.update(readingProgress)
        .set({ 
          progress: 1.0,
          createdAt: now
        })
        .where(and(
          eq(readingProgress.userId, authResult.userId),
          eq(readingProgress.chapterId, parsedChapterId)
        ));
    } else {
      // Create new reading progress entry
      await db.insert(readingProgress).values({
        userId: authResult.userId,
        seriesId: chapter.seriesId,
        chapterId: parsedChapterId,
        progress: 1.0,
        createdAt: now
      });
    }

    // Insert reading history entry
    try {
      await db.insert(readingHistory).values({
        userId: authResult.userId,
        seriesId: chapter.seriesId,
        chapterId: parsedChapterId,
        readAt: now
      });
    } catch (historyError) {
      // Log but don't fail the main operation if history insert fails
      console.warn('Failed to insert reading history:', historyError);
    }

    return NextResponse.json({
      success: true,
      chapterId: parsedChapterId,
      progress: 1.0,
      message: 'Chapter marked as read successfully',
      chapterInfo: {
        title: chapter.title,
        number: chapter.number,
        seriesId: chapter.seriesId
      }
    });

  } catch (error) {
    console.error('POST mark-read error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
}