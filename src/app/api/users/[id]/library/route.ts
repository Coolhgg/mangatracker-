import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { libraries, series, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Simple in-memory IP rate limiter (best-effort per instance)
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 60; // max requests per window per IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string | null) {
  const key = ip || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limit by IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || null;
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({
        error: 'Too many requests. Please slow down.',
        code: 'RATE_LIMITED'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000)).toString(),
        },
      });
    }

    // Enforce JSON content-type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json', code: 'INVALID_CONTENT_TYPE' }, { status: 415 });
    }

    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'MISSING_AUTH_HEADER' 
      }, { status: 401 });
    }

    // Extract userId from token (treating token as userId for demo)
    const token = authHeader.replace('Bearer ', '').trim();
    const authenticatedUserId = parseInt(token);

    if (!authenticatedUserId || isNaN(authenticatedUserId)) {
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // Verify user exists
    const userExists = await db.select().from(users).where(eq(users.id, authenticatedUserId)).limit(1);
    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 401 });
    }

    // Authorization check - verify URL parameter matches authenticated user
    const urlUserId = parseInt(params.id);
    if (!urlUserId || isNaN(urlUserId)) {
      return NextResponse.json({ 
        error: 'Invalid user ID in URL',
        code: 'INVALID_URL_USER_ID' 
      }, { status: 400 });
    }

    if (authenticatedUserId !== urlUserId) {
      return NextResponse.json({ 
        error: 'Access denied: Cannot modify another user\'s library',
        code: 'UNAUTHORIZED_USER_ACCESS' 
      }, { status: 403 });
    }

    // Parse request body
    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { seriesId, status, rating, notes } = requestBody;

    // Validate required fields
    if (!seriesId || isNaN(parseInt(seriesId))) {
      return NextResponse.json({ 
        error: 'Valid seriesId is required',
        code: 'MISSING_SERIES_ID' 
      }, { status: 400 });
    }

    // Validate optional fields
    const validStatuses = ['reading', 'completed', 'paused', 'dropped', 'plan'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    if (rating !== undefined && (Number.isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 10)) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 10',
        code: 'INVALID_RATING' 
      }, { status: 400 });
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json({ 
        error: 'Notes must be a string',
        code: 'INVALID_NOTES' 
      }, { status: 400 });
    }
    if (typeof notes === 'string' && notes.length > 2000) {
      return NextResponse.json({ 
        error: 'Notes too long (max 2000 chars)',
        code: 'NOTES_TOO_LONG' 
      }, { status: 400 });
    }

    // Verify series exists
    const seriesExists = await db.select()
      .from(series)
      .where(eq(series.id, parseInt(seriesId)))
      .limit(1);

    if (seriesExists.length === 0) {
      return NextResponse.json({ 
        error: 'Series not found',
        code: 'SERIES_NOT_FOUND' 
      }, { status: 404 });
    }

    const seriesRecord = seriesExists[0];

    // Check if library entry already exists
    const existingEntry = await db.select()
      .from(libraries)
      .where(and(
        eq(libraries.userId, authenticatedUserId),
        eq(libraries.seriesId, parseInt(seriesId))
      ))
      .limit(1);

    let result;
    let isUpdate = false;

    if (existingEntry.length > 0) {
      // Update existing entry
      isUpdate = true;
      const updateData: any = {};
      
      if (status !== undefined) updateData.status = status;
      if (rating !== undefined) updateData.rating = Number(rating);
      if (notes !== undefined) updateData.notes = notes;

      const updated = await db.update(libraries)
        .set(updateData)
        .where(and(
          eq(libraries.userId, authenticatedUserId),
          eq(libraries.seriesId, parseInt(seriesId))
        ))
        .returning();

      result = updated[0];
    } else {
      // Create new entry
      const insertData = {
        userId: authenticatedUserId,
        seriesId: parseInt(seriesId),
        status: status || 'reading',
        rating: rating !== undefined ? Number(rating) : null,
        notes: notes || null,
        updatedAt: new Date().toISOString()
      } as const;

      const created = await db.insert(libraries)
        .values(insertData)
        .returning();

      result = created[0];
    }

    // Format response with series info
    const response = {
      id: result.id,
      userId: result.userId,
      seriesId: result.seriesId,
      status: result.status,
      rating: result.rating,
      notes: result.notes,
      series: {
        id: seriesRecord.id,
        title: seriesRecord.title,
        slug: seriesRecord.slug
      }
    };

    return NextResponse.json(response, { status: isUpdate ? 200 : 201, headers: {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': Math.max(0, rl.remaining).toString(),
      'X-RateLimit-Reset': Math.ceil(rl.resetAt / 1000).toString(),
    }});

  } catch (error) {
    console.error('POST /api/users/[id]/library error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
}