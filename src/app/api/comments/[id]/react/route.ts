import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reactions, comments, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { emitCommentEvent } from "@/lib/events";

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
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const commentId = params.id;

    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json({ 
        error: 'Valid comment ID is required',
        code: 'INVALID_COMMENT_ID' 
      }, { status: 400 });
    }

    const parsedCommentId = parseInt(commentId);

    const requestBody = await request.json();
    const { type } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ 
        error: 'Reaction type is required',
        code: 'MISSING_REACTION_TYPE' 
      }, { status: 400 });
    }

    const validTypes = ['like', 'dislike', 'love', 'laugh', 'angry', 'thumbs_up', 'thumbs_down', 'heart'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid reaction type. Must be one of: ' + validTypes.join(', '),
        code: 'INVALID_REACTION_TYPE' 
      }, { status: 400 });
    }

    // Verify comment exists and is not deleted
    const commentResult = await db.select({ 
      id: comments.id,
      deleted: comments.deleted 
    })
      .from(comments)
      .where(eq(comments.id, parsedCommentId))
      .limit(1);

    if (commentResult.length === 0) {
      return NextResponse.json({ 
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    if (commentResult[0].deleted) {
      return NextResponse.json({ 
        error: 'Cannot react to deleted comment',
        code: 'COMMENT_DELETED' 
      }, { status: 400 });
    }

    // Check if reaction already exists (upsert behavior)
    const existingReaction = await db.select()
      .from(reactions)
      .where(and(
        eq(reactions.commentId, parsedCommentId),
        eq(reactions.userId, authResult.userId)
      ))
      .limit(1);

    let result;
    let message;

    if (existingReaction.length > 0) {
      // Update existing reaction
      result = await db.update(reactions)
        .set({ type })
        .where(and(
          eq(reactions.commentId, parsedCommentId),
          eq(reactions.userId, authResult.userId)
        ))
        .returning();
      message = 'Reaction updated successfully';
    } else {
      // Create new reaction
      result = await db.insert(reactions)
        .values({
          commentId: parsedCommentId,
          userId: authResult.userId,
          type
        })
        .returning();
      message = 'Reaction added successfully';
    }

    // Emit realtime event
    emitCommentEvent({ type: 'reaction.updated', payload: { commentId: parsedCommentId, userId: authResult.userId, type } });

    return NextResponse.json({
      id: result[0].id,
      commentId: result[0].commentId,
      userId: result[0].userId,
      type: result[0].type,
      message
    }, { status: existingReaction.length > 0 ? 200 : 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const commentId = params.id;

    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json({ 
        error: 'Valid comment ID is required',
        code: 'INVALID_COMMENT_ID' 
      }, { status: 400 });
    }

    const parsedCommentId = parseInt(commentId);

    // Verify comment exists
    const commentResult = await db.select({ id: comments.id })
      .from(comments)
      .where(eq(comments.id, parsedCommentId))
      .limit(1);

    if (commentResult.length === 0) {
      return NextResponse.json({ 
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if reaction exists for this user and comment
    const existingReaction = await db.select()
      .from(reactions)
      .where(and(
        eq(reactions.commentId, parsedCommentId),
        eq(reactions.userId, authResult.userId)
      ))
      .limit(1);

    if (existingReaction.length === 0) {
      return NextResponse.json({ 
        error: 'Reaction not found for this user and comment',
        code: 'REACTION_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the reaction
    const deleted = await db.delete(reactions)
      .where(and(
        eq(reactions.commentId, parsedCommentId),
        eq(reactions.userId, authResult.userId)
      ))
      .returning();

    // Emit realtime event
    emitCommentEvent({ type: 'reaction.updated', payload: { commentId: parsedCommentId, userId: authResult.userId, type: null } });

    return NextResponse.json({
      success: true,
      message: 'Reaction removed successfully',
      commentId: parsedCommentId
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}