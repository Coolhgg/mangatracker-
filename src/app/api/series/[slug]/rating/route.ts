import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { series, users, mangaRatings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
  slug: string;
}

async function authenticateUser(request: NextRequest): Promise<number | null> {
  try {
    // Try cookie-based session first (better-auth)
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.email) {
      const userRecord = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
      
      if (userRecord.length > 0) {
        return userRecord[0].id;
      }
    }
  } catch (error) {
    // Session auth failed, try Bearer token
  }

  // Fallback to Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userId = parseInt(token);
    if (!isNaN(userId) && userId > 0) {
      return userId;
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;

    // Find series by slug
    const seriesRecord = await db.select({ id: series.id })
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesRecord.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesRecord[0].id;

    // Get user's rating for this series
    const rating = await db.select({ value: mangaRatings.value })
      .from(mangaRatings)
      .where(and(eq(mangaRatings.userId, userId), eq(mangaRatings.seriesId, seriesId)))
      .limit(1);

    if (rating.length === 0) {
      return NextResponse.json({ value: null });
    }

    return NextResponse.json({ value: rating[0].value });
  } catch (error) {
    console.error('GET rating error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { value } = body;

    // Validate value
    if (value === undefined || value === null) {
      return NextResponse.json({ 
        error: "Value is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 10) {
      return NextResponse.json({ 
        error: "Value must be an integer between 0 and 10",
        code: "INVALID_VALUE_RANGE" 
      }, { status: 400 });
    }

    // Find series by slug
    const seriesRecord = await db.select({ id: series.id })
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesRecord.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesRecord[0].id;

    // Check if rating already exists
    const existingRating = await db.select({ id: mangaRatings.id })
      .from(mangaRatings)
      .where(and(eq(mangaRatings.userId, userId), eq(mangaRatings.seriesId, seriesId)))
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      const updated = await db.update(mangaRatings)
        .set({ value })
        .where(and(eq(mangaRatings.userId, userId), eq(mangaRatings.seriesId, seriesId)))
        .returning({ value: mangaRatings.value });

      return NextResponse.json({ value: updated[0].value });
    } else {
      // Insert new rating
      const created = await db.insert(mangaRatings)
        .values({
          userId,
          seriesId,
          value,
          createdAt: new Date().toISOString()
        })
        .returning({ value: mangaRatings.value });

      return NextResponse.json({ value: created[0].value }, { status: 201 });
    }
  } catch (error) {
    console.error('POST rating error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}