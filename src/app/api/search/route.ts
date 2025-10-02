import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db';
import { series, mangaChapters } from '@/db/schema';
import { like, or, and, gte, eq, desc, asc, sql, inArray } from 'drizzle-orm';

// Search API with validation and database fallback
// Updated: 2025-09-29T19:54:30Z - Fixed per_page validation order
// Optional Typesense client (only used when env is configured)
let typesenseClient: any = null;
try {
  const hasTypesense = !!process.env.TYPESENSE_HOST && !!process.env.TYPESENSE_API_KEY;
  if (hasTypesense) {
    // Lazy require to avoid bundling on edge
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Typesense = require('typesense');
    typesenseClient = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST,
          port: process.env.TYPESENSE_PORT ? Number(process.env.TYPESENSE_PORT) : 443,
          protocol: process.env.TYPESENSE_PROTOCOL || 'https',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 3,
    });
  }
} catch {
  typesenseClient = null; // ignore typesense init errors and fall back to DB
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    
    // Validate required query parameter FIRST
    if (!q.trim()) {
      return NextResponse.json({
        error: "Query parameter 'q' is required",
        code: "MISSING_QUERY"
      }, { status: 400 });
    }
    
    const sort = searchParams.get("sort") || "relevance";
    const status = searchParams.get("status");
    const rating = searchParams.get("rating");
    const source = searchParams.get("source");
    const language = searchParams.get("language");
    const perPageRaw = parseInt(searchParams.get("per_page") || "20");
    
    // Validate per_page is positive
    if (perPageRaw < 1) {
      return NextResponse.json({
        error: "Invalid per_page value. Must be a positive integer.",
        code: "INVALID_PER_PAGE"
      }, { status: 400 });
    }
    
    const perPage = Math.min(100, perPageRaw);

    // First try Typesense if configured
    if (typesenseClient) {
      try {
        // Build filter_by string
        const filters: string[] = [];
        if (status) filters.push(`status:=${status}`);
        if (rating) {
          const minRating = parseFloat(rating);
          if (!isNaN(minRating) && minRating >= 1 && minRating <= 5) {
            filters.push(`rating:>=${minRating}`);
          }
        }
        // New: map additional filters when present
        if (source) filters.push(`source:=${source}`);
        if (language) filters.push(`language:=${language}`);
        const filter_by = filters.join(' && ');

        // Map sort to Typesense sort_by
        let sort_by: string | undefined;
        switch (sort) {
          case 'rating':
            sort_by = 'rating:desc';
            break;
          case 'year':
            sort_by = 'year:desc';
            break;
          case 'title':
            sort_by = 'title:asc';
            break;
          default:
            sort_by = undefined; // rely on textual relevance
        }

        const searchParamsTs: any = {
          q: q.trim(),
          query_by: 'title,description,tags',
          per_page: perPage,
        };
        if (filter_by) searchParamsTs.filter_by = filter_by;
        if (sort_by) searchParamsTs.sort_by = sort_by;

        const tsRes = await typesenseClient.collections('series').documents().search(searchParamsTs);
        const hits = (tsRes.hits || []).map((h: any) => {
          const s = h.document || {};
          return {
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.description || '',
            coverImageUrl: s.coverImageUrl || s.cover_image_url || '',
            tags: Array.isArray(s.tags) ? s.tags : (typeof s.tags === 'string' ? (()=>{ try { return JSON.parse(s.tags); } catch { return []; } })() : []),
            ratingAvg: s.rating || 0,
            year: s.year,
            status: s.status || '',
            // Include when present in index
            source: s.source || s.sourceName || undefined,
            language: s.language || undefined,
          };
        });
        return NextResponse.json({ hits });
      } catch (e) {
        // Silent fallback to DB search
      }
    }

    // Build search conditions (DB fallback)
    const searchTerm = `%${q.trim().toLowerCase()}%`;
    const conditions = [] as any[];

    // Text search in title and description
    conditions.push(or(
      like(sql`lower(${series.title})`, searchTerm),
      like(sql`lower(${series.description})`, searchTerm)
    ));

    // Apply status filter
    if (status) {
      conditions.push(eq(series.status, status));
    }

    // Apply rating filter
    if (rating) {
      const minRating = parseFloat(rating);
      if (!isNaN(minRating) && minRating >= 1 && minRating <= 5) {
        conditions.push(gte(series.rating, minRating));
      }
    }

    // New: apply source/language filters in DB fallback when possible
    if (source) {
      conditions.push(eq(series.sourceName, source));
    }
    if (language) {
      // EXISTS chapter with matching language for this series
      conditions.push(sql`EXISTS (SELECT 1 FROM manga_chapters mc WHERE mc.series_id = ${series.id} AND mc.language = ${language})`);
    }

    // Build query
    let query = db.select({
      id: series.id,
      slug: series.slug,
      title: series.title,
      description: series.description,
      coverImageUrl: series.coverImageUrl,
      tags: series.tags,
      ratingAvg: series.rating,
      year: series.year,
      status: series.status,
      sourceName: series.sourceName,
    }).from(series);

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (sort) {
      case "rating":
        query = query.orderBy(desc(series.rating));
        break;
      case "year":
        query = query.orderBy(desc(series.year));
        break;
      case "title":
        query = query.orderBy(asc(series.title));
        break;
      case "relevance":
      default:
        // For relevance, prefer exact title matches, then rating
        query = query.orderBy(desc(series.rating), desc(series.year));
        break;
    }

    // Apply pagination limit
    const results = await query.limit(perPage);

    // Build a language map for returned series (first non-null chapter language)
    const ids = results.map(r => r.id).filter(Boolean) as number[];
    let langMap = new Map<number, string>();
    if (ids.length > 0) {
      const rows = await db
        .select({ sId: mangaChapters.seriesId, lang: mangaChapters.language })
        .from(mangaChapters)
        .where(inArray(mangaChapters.seriesId, ids));
      for (const r of rows) {
        const key = r.sId as unknown as number;
        if (r.lang && !langMap.has(key)) langMap.set(key, r.lang);
      }
    }

    // Format results
    const hits = results.map(s => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description || '',
      coverImageUrl: s.coverImageUrl || '',
      tags: Array.isArray(s.tags) ? s.tags : [],
      ratingAvg: s.ratingAvg || 0,
      year: s.year,
      status: s.status || '',
      // Include when present
      source: s.sourceName || undefined,
      language: langMap.get(s.id) || undefined,
    }));

    return NextResponse.json({ hits });

  } catch (error) {
    console.error("[search] error:", error);
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}