import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comments, series, users, threads } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { rateLimitRequest } from '@/lib/rate-limit';
import { sanitizeLen } from '@/lib/sanitize';

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
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    const Query = z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
      threadId: z.coerce.number().int().positive().optional(),
    });
    const parsedQuery = Query.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      threadId: searchParams.get('threadId') ?? undefined,
    });
    if (!parsedQuery.success) {
      return NextResponse.json({ error: parsedQuery.error.flatten() }, { status: 400 });
    }
    const { page = 1, pageSize = 20, threadId } = parsedQuery.data;

    // Find series by slug
    const seriesResult = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesId = seriesResult[0].id;

    // If threadId is provided, ensure it exists and belongs to the series
    if (threadId) {
      const t = await db
        .select({ id: threads.id, seriesId: threads.seriesId })
        .from(threads)
        .where(eq(threads.id, threadId))
        .limit(1);
      if (!t.length) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }
      if (t[0].seriesId !== seriesId) {
        return NextResponse.json({ error: 'Thread does not belong to series' }, { status: 400 });
      }
    }

    // Get comments with pagination
    const offset = (page - 1) * pageSize;
    const whereClause = threadId
      ? and(eq(comments.seriesId, seriesId), eq(comments.threadId, threadId))
      : eq(comments.seriesId, seriesId);

    let commentsResult: Array<{ id: number; userId: number; content: string; createdAt: any; threadId: number | null; parentId?: number | null }> = [];
    try {
      const rows = await db
        .select()
        .from(comments)
        .where(whereClause as any)
        .orderBy(desc(comments.createdAt))
        .limit(pageSize + 1)
        .offset(offset);

      commentsResult = rows.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        content: r.content,
        createdAt: r.createdAt,
        threadId: r.threadId ?? null,
        parentId: r.parentId ?? null,
      }));
    } catch (e: any) {
      console.error('DB error fetching comments', { seriesId, threadId, error: e?.message || e });
      return NextResponse.json({ error: 'Query failed', details: String(e?.message || e) }, { status: 500 });
    }

    const hasMore = commentsResult.length > pageSize;
    const items = commentsResult.slice(0, pageSize).map(comment => ({
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      threadId: comment.threadId ?? null,
      parentId: comment.parentId ?? null,
      createdAt: (() => {
        const v: any = comment.createdAt as any;
        // normalize to ISO: handle number (epoch), numeric-like string, ISO string, or fallback to raw string
        if (typeof v === 'number') return new Date(v).toISOString();
        if (typeof v === 'string') {
          const n = Number(v);
          if (!Number.isNaN(n)) return new Date(n).toISOString();
          const t = Date.parse(v);
          return isNaN(t) ? v : new Date(t).toISOString();
        }
        try { return new Date(v).toISOString(); } catch { return String(v); }
      })(),
    }));

    return NextResponse.json({ items, hasMore });

  } catch (error: any) {
    console.error('GET /api/series/[slug]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error?.message || error) }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Rate limit per IP (route/key specific)
    const limited = await rateLimitRequest(request as unknown as Request, { key: 'series:comments:create', limit: 10, windowMs: 60_000 });
    if (!limited.ok) return limited.response;

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

    const Body = z.object({
      content: z.string().min(1).max(2000),
      threadId: z.coerce.number().int().positive().optional(),
      parentId: z.coerce.number().int().positive().optional(),
    });
    const json = await request.json().catch(() => null);
    const parsed = Body.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { content, threadId, parentId } = parsed.data;

    // If threadId provided, ensure it exists and belongs to series
    if (threadId) {
      const t = await db.select({ id: threads.id, seriesId: threads.seriesId })
        .from(threads)
        .where(eq(threads.id, threadId))
        .limit(1);
      if (!t.length) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      if (t[0].seriesId !== seriesId) return NextResponse.json({ error: 'Thread does not belong to series' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const clean = sanitizeLen(content.trim(), 2000);
    if (!clean) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // Create comment (avoid .returning() for SQLite compatibility)
    await db.insert(comments).values({
      seriesId,
      userId: authResult.userId,
      threadId: threadId ?? null,
      parentId: parentId ?? null,
      content: clean,
      createdAt: now,
    });

    // Re-select the inserted row deterministically
    const [created] = await db
      .select({ id: comments.id, userId: comments.userId, content: comments.content, threadId: comments.threadId, parentId: comments.parentId, createdAt: comments.createdAt })
      .from(comments)
      .where(and(eq(comments.seriesId, seriesId), eq(comments.userId, authResult.userId)))
      .orderBy(desc(comments.id))
      .limit(1);
    if (!created) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    const response = {
      id: created.id,
      userId: created.userId,
      content: created.content,
      threadId: created.threadId ?? null,
      parentId: created.parentId ?? null,
      createdAt: new Date(created.createdAt).toISOString(),
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST /api/series/[slug]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}