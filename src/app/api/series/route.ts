import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { series, users } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const q = (searchParams.get('q') || '').trim();

    if (slug) {
      // Single series lookup by slug with graceful 404 handling
      try {
        const seriesResult = await db.select()
          .from(series)
          .where(eq(series.slug, slug.toLowerCase().trim()))
          .limit(1);

        if (seriesResult.length === 0) {
          return NextResponse.json({ 
            ok: false,
            item: null,
            error: 'Series not found',
            code: 'SERIES_NOT_FOUND' 
          }, { status: 404 });
        }

        const s = seriesResult[0];
        const response = {
          ok: true,
          item: {
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.description || '',
            coverImageUrl: s.coverImageUrl || '',
            tags: Array.isArray(s.tags) ? s.tags : [],
            source: {
              name: s.sourceName || '',
              url: s.sourceUrl || ''
            },
            ratingAvg: s.rating || 0,
            year: s.year,
            status: s.status || ''
          }
        };

        return NextResponse.json(response);
        
      } catch (slugError) {
        console.error('GET series by slug error:', slugError);
        // Always return a safe 404 shape on errors to avoid 500s
        return NextResponse.json({ 
          ok: false,
          item: null,
          error: 'Series not found',
          code: 'SERIES_NOT_FOUND' 
        }, { status: 404 });
      }
    }

    // Paginated list + optional search
    const offset = (page - 1) * pageSize;

    // Build query conditionally to avoid passing undefined to .where()
    let query = db.select().from(series);
    if (q) {
      query = query.where(
        or(
          like(series.title, `%${q}%`),
          like(series.slug, `%${q}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(series.createdAt))
      .limit(pageSize + 1)
      .offset(offset);

    const hasMore = results.length > pageSize;
    const items = results.slice(0, pageSize).map(s => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description || '',
      coverImageUrl: s.coverImageUrl || '',
      tags: Array.isArray(s.tags) ? s.tags : [],
      source: {
        name: s.sourceName || '',
        url: s.sourceUrl || ''
      },
      ratingAvg: s.rating || 0,
      year: s.year,
      status: s.status || ''
    }));

    return NextResponse.json({ items, hasMore, page, pageSize, q });

  } catch (error) {
    console.error('GET /api/series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      description,
      coverImageUrl,
      tags,
      sourceName,
      sourceUrl,
      year,
      status
    } = body;

    // Validate required fields
    if (!slug || !title) {
      return NextResponse.json({
        error: 'Slug and title are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Check slug uniqueness
    const existingSeries = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (existingSeries.length > 0) {
      return NextResponse.json({
        error: 'Slug already exists',
        code: 'SLUG_CONFLICT'
      }, { status: 409 });
    }

    // Use Date objects for PostgreSQL timestamps (defaults will be used via .defaultNow())
    const newSeries = await db.insert(series).values({
      slug: slug.trim(),
      title: title.trim(),
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl?.trim() || null,
      tags: Array.isArray(tags) ? tags : [],
      sourceName: sourceName?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      rating: 0,
      year: year || null,
      status: status?.trim() || 'ongoing',
      // createdAt and updatedAt will use defaultNow() from schema
    }).returning();

    const created = newSeries[0];
    const response = {
      id: created.id,
      slug: created.slug,
      title: created.title,
      description: created.description || '',
      coverImageUrl: created.coverImageUrl || '',
      tags: Array.isArray(created.tags) ? created.tags : [],
      source: {
        name: created.sourceName || '',
        url: created.sourceUrl || ''
      },
      ratingAvg: created.rating || 0,
      year: created.year,
      status: created.status || ''
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST /api/series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}