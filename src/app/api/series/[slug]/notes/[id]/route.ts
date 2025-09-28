import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mangaNotes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const noteId = params.id;

    // Validate noteId parameter
    if (!noteId || isNaN(parseInt(noteId))) {
      return NextResponse.json(
        { 
          error: "Valid note ID is required",
          code: "INVALID_NOTE_ID" 
        },
        { status: 400 }
      );
    }

    // Authentication - try cookie-based session first, then fallback to Bearer token
    let userId: number | null = null;

    try {
      // Try cookie-based session first (better-auth)
      const session = await auth.api.getSession({
        headers: request.headers
      });
      
      if (session?.user?.id) {
        // For better-auth, user.id is text, but we need to map to users table integer ID
        // This would require a lookup to the users table, but for now assume direct mapping
        userId = parseInt(session.user.id);
      }
    } catch (error) {
      // Cookie session failed, try Bearer token fallback
    }

    // Fallback to Authorization header if cookie session failed
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const parsedUserId = parseInt(token);
        if (!isNaN(parsedUserId)) {
          userId = parsedUserId;
        }
      }
    }

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        },
        { status: 401 }
      );
    }

    // Find and verify ownership of the note
    const existingNote = await db.select()
      .from(mangaNotes)
      .where(
        and(
          eq(mangaNotes.id, parseInt(noteId)),
          eq(mangaNotes.userId, userId)
        )
      )
      .limit(1);

    if (existingNote.length === 0) {
      return NextResponse.json(
        { 
          error: 'Note not found',
          code: 'NOTE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Delete the note
    const deletedNote = await db.delete(mangaNotes)
      .where(
        and(
          eq(mangaNotes.id, parseInt(noteId)),
          eq(mangaNotes.userId, userId)
        )
      )
      .returning();

    if (deletedNote.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to delete note',
          code: 'DELETE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
      deletedNoteId: parseInt(noteId)
    });

  } catch (error) {
    console.error('DELETE note error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}