import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { libraries, users } from '@/db/schema';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const libraryId = params.id;

    if (!libraryId || isNaN(parseInt(libraryId))) {
      return NextResponse.json({ 
        error: "Valid library entry ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { status, rating, notes } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read'].includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be: reading, completed, on_hold, dropped, or plan_to_read",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return NextResponse.json({ 
        error: "Invalid rating. Must be a number between 0-10",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    // Check if library entry exists and belongs to user
    const existingEntry = await db.select()
      .from(libraries)
      .where(and(eq(libraries.id, parseInt(libraryId)), eq(libraries.userId, authResult.userId)))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json({ 
        error: 'Library entry not found or access denied',
        code: "ENTRY_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (status !== undefined) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;

    // Update the library entry
    const updated = await db.update(libraries)
      .set(updateData)
      .where(and(eq(libraries.id, parseInt(libraryId)), eq(libraries.userId, authResult.userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update library entry',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0]);

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
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const libraryId = params.id;

    if (!libraryId || isNaN(parseInt(libraryId))) {
      return NextResponse.json({ 
        error: "Valid library entry ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if library entry exists and belongs to user
    const existingEntry = await db.select()
      .from(libraries)
      .where(and(eq(libraries.id, parseInt(libraryId)), eq(libraries.userId, authResult.userId)))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json({ 
        error: 'Library entry not found or access denied',
        code: "ENTRY_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete the library entry
    const deleted = await db.delete(libraries)
      .where(and(eq(libraries.id, parseInt(libraryId)), eq(libraries.userId, authResult.userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete library entry',
        code: "DELETE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Series removed from library successfully",
      seriesId: deleted[0].seriesId
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}