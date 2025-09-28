/**
 * POST /api/chapters/[id]/mark-unread - Mark chapter as unread for user
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { readingProgress, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function authenticate(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      const userRecord = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
      if (userRecord.length > 0) return { userId: userRecord[0].id };
    }
  } catch {}
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const userId = parseInt(token);
    if (!isNaN(userId)) {
      const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userRecord.length > 0) return { userId: userRecord[0].id };
    }
  }
  return null;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticate(request);
    if (!authResult) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const chapterId = params.id;
    if (!chapterId || isNaN(parseInt(chapterId))) {
      return NextResponse.json({ error: 'Valid chapter ID is required', code: 'INVALID_CHAPTER_ID' }, { status: 400 });
    }
    const parsedChapterId = parseInt(chapterId);

    // Either delete progress or set to 0
    await db.delete(readingProgress).where(and(eq(readingProgress.userId, authResult.userId), eq(readingProgress.chapterId, parsedChapterId)));

    return NextResponse.json({ success: true, chapterId: parsedChapterId, progress: 0 });
  } catch (error) {
    console.error('POST mark-unread error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';