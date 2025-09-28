import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { series, users, mangaNotes } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;

    // Find series by slug
    const seriesResult = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesResult[0].id;

    // Get all notes for this user and series, ordered by createdAt descending
    const userNotes = await db.select({
      id: mangaNotes.id,
      body: mangaNotes.body,
      createdAt: mangaNotes.createdAt
    })
      .from(mangaNotes)
      .where(and(
        eq(mangaNotes.userId, authResult.userId),
        eq(mangaNotes.seriesId, seriesId)
      ))
      .orderBy(desc(mangaNotes.createdAt));

    // Convert timestamps to ISO strings if needed
    const formattedNotes = userNotes.map(note => ({
      id: note.id,
      body: note.body,
      createdAt: note.createdAt
    }));

    return NextResponse.json(formattedNotes);

  } catch (error) {
    console.error('GET notes error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    const requestBody = await request.json();
    const { body } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate body field
    if (!body) {
      return NextResponse.json({ 
        error: "Body is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (typeof body !== 'string') {
      return NextResponse.json({ 
        error: "Body must be a string",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    // Trim and validate length
    const trimmedBody = body.trim();
    if (trimmedBody.length === 0) {
      return NextResponse.json({ 
        error: "Body cannot be empty",
        code: "EMPTY_BODY" 
      }, { status: 400 });
    }

    if (trimmedBody.length > 2000) {
      return NextResponse.json({ 
        error: "Body cannot exceed 2000 characters",
        code: "BODY_TOO_LONG" 
      }, { status: 400 });
    }

    // Find series by slug
    const seriesResult = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesResult[0].id;
    const now = new Date().toISOString();

    // Create the note
    const newNote = await db.insert(mangaNotes)
      .values({
        userId: authResult.userId,
        seriesId: seriesId,
        body: trimmedBody,
        createdAt: now
      })
      .returning();

    // Format response
    const createdNote = {
      id: newNote[0].id,
      body: newNote[0].body,
      createdAt: newNote[0].createdAt
    };

    return NextResponse.json(createdNote, { status: 201 });

  } catch (error) {
    console.error('POST notes error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}