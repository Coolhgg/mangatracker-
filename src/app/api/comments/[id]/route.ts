import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comments, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { sanitizeComment } from "@/lib/sanitize";
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
        return { 
          userId: userRecord[0].id, 
          isAdmin: userRecord[0].roles?.includes('admin') || false 
        };
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
        return { 
          userId: userRecord[0].id, 
          isAdmin: userRecord[0].roles?.includes('admin') || false 
        };
      }
    }
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    
    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json({
        error: "Valid comment ID is required",
        code: "INVALID_COMMENT_ID"
      }, { status: 400 });
    }
    
    const parsedCommentId = parseInt(commentId);
    
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED"
      }, { status: 401 });
    }
    
    const { userId, isAdmin } = authResult;
    
    // Get request body
    const body = await request.json();
    let { content } = body;
    
    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({
        error: "Content is required and cannot be empty",
        code: "INVALID_CONTENT"
      }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({
        error: "Content too long (max 2000 chars)",
        code: "CONTENT_TOO_LONG"
      }, { status: 400 });
    }

    // sanitize content
    content = sanitizeComment(content.trim());
    
    // Check if comment exists
    const existingComment = await db.select()
      .from(comments)
      .where(eq(comments.id, parsedCommentId))
      .limit(1);
    
    if (existingComment.length === 0) {
      return NextResponse.json({
        error: "Comment not found",
        code: "COMMENT_NOT_FOUND"
      }, { status: 404 });
    }
    
    const comment = existingComment[0];
    
    // Check ownership or admin privileges
    if (!isAdmin && comment.userId !== userId) {
      return NextResponse.json({
        error: "You can only edit your own comments",
        code: "FORBIDDEN"
      }, { status: 403 });
    }
    
    // Check if comment is already deleted
    if (comment.deleted) {
      return NextResponse.json({
        error: "Cannot edit a deleted comment",
        code: "COMMENT_DELETED"
      }, { status: 400 });
    }
    
    // Update the comment
    const updatedComment = await db.update(comments)
      .set({
        content,
        edited: true
      })
      .where(eq(comments.id, parsedCommentId))
      .returning();
    
    if (updatedComment.length === 0) {
      return NextResponse.json({
        error: "Failed to update comment",
        code: "UPDATE_FAILED"
      }, { status: 500 });
    }
    
    const result = updatedComment[0];

    // Emit realtime event for updates
    emitCommentEvent({ type: 'comment.updated', payload: { comment: result } });
    
    return NextResponse.json({
      id: result.id,
      content: result.content,
      edited: result.edited,
      createdAt: result.createdAt
    }, { status: 200 });
    
  } catch (error) {
    console.error('PATCH error:', error);
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
    const commentId = params.id;
    
    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json({
        error: "Valid comment ID is required",
        code: "INVALID_COMMENT_ID"
      }, { status: 400 });
    }
    
    const parsedCommentId = parseInt(commentId);
    
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED"
      }, { status: 401 });
    }
    
    const { userId, isAdmin } = authResult;
    
    // Check if comment exists
    const existingComment = await db.select()
      .from(comments)
      .where(eq(comments.id, parsedCommentId))
      .limit(1);
    
    if (existingComment.length === 0) {
      return NextResponse.json({
        error: "Comment not found",
        code: "COMMENT_NOT_FOUND"
      }, { status: 404 });
    }
    
    const comment = existingComment[0];
    
    // Check ownership or admin privileges
    if (!isAdmin && comment.userId !== userId) {
      return NextResponse.json({
        error: "You can only delete your own comments",
        code: "FORBIDDEN"
      }, { status: 403 });
    }
    
    // Check if comment is already deleted
    if (comment.deleted) {
      return NextResponse.json({
        error: "Comment is already deleted",
        code: "ALREADY_DELETED"
      }, { status: 400 });
    }
    
    // Soft delete the comment
    const deletedComment = await db.update(comments)
      .set({
        deleted: true
      })
      .where(eq(comments.id, parsedCommentId))
      .returning();
    
    if (deletedComment.length === 0) {
      return NextResponse.json({
        error: "Failed to delete comment",
        code: "DELETE_FAILED"
      }, { status: 500 });
    }

    // Emit realtime event for deletion
    emitCommentEvent({ type: 'comment.deleted', payload: { id: parsedCommentId } });
    
    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
      commentId: parsedCommentId
    }, { status: 200 });
    
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}