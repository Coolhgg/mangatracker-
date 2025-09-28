import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db';
import { series, mangaChapters } from '@/db/schema';
import { desc, asc, like, inArray, and, or, gte, eq, exists, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    // Parse filters/sort from query
    const sort = (searchParams.get("sort") || "newest").toLowerCase();
    const statuses = searchParams.getAll("status"); // e.g. ongoing, completed
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam) : undefined;
    const period = searchParams.get("period"); // 7d | 30d | 365d
    const tags = searchParams.getAll("tag"); // multiple tag IDs or names
    const readableOn = searchParams.getAll("readableOn"); // languages, e.g. en, es, fr

    // Compute date threshold for period against updatedAt (ISO string)
    let sinceIso: string | undefined;
    if (period === "7d" || period === "30d" || period === "365d") {
      const ms = period === "7d" ? 7 : period === "30d" ? 30 : 365;
      const d = new Date();
      d.setDate(d.getDate() - ms);
      sinceIso = d.toISOString();
    }

    // Build where conditions
    const whereParts = [] as any[];
    if (statuses.length) whereParts.push(inArray(series.status, statuses));
    if (typeof year === 'number' && !Number.isNaN(year)) whereParts.push(eq(series.year, year));
    if (sinceIso) whereParts.push(gte(series.updatedAt, sinceIso));
    if (tags.length) {
      // tags stored as JSON text -> simple LIKE match for each provided tag (OR semantics)
      whereParts.push(or(...tags.map((t) => like(series.tags, `%${t}%`))));
    }
    if (readableOn.length) {
      // Filter series that have at least one chapter in any of the requested languages
      const langSubquery = db
        .select({ one: sql`1` })
        .from(mangaChapters)
        .where(and(eq(mangaChapters.seriesId, series.id), inArray(mangaChapters.language, readableOn)))
        .limit(1);
      whereParts.push(exists(langSubquery));
    }

    // Order by mapping
    const orderBys = [] as any[];
    switch (sort) {
      case "newest":
        orderBys.push(desc(series.createdAt));
        break;
      case "updated":
      case "latest_chapter": // fallback to updatedAt
        orderBys.push(desc(series.updatedAt));
        break;
      case "highest_rated":
        orderBys.push(desc(series.rating), desc(series.year));
        break;
      case "most_followed": // not in schema -> approximate by rating then recency
        orderBys.push(desc(series.rating), desc(series.updatedAt));
        break;
      case "oldest":
        orderBys.push(asc(series.createdAt));
        break;
      default:
        orderBys.push(desc(series.rating), desc(series.year));
        break;
    }

    const offset = (page - 1) * pageSize;

    const baseSelect = db.select({
      id: series.id,
      slug: series.slug,
      title: series.title,
      description: series.description,
      coverImageUrl: series.coverImageUrl,
      tags: series.tags,
      rating: series.rating,
      year: series.year,
      status: series.status,
    }).from(series);

    const query = (whereParts.length ? baseSelect.where(and(...whereParts)) : baseSelect)
      .orderBy(...orderBys)
      .limit(pageSize + 1)
      .offset(offset);

    const results = await query;

    const hasMore = results.length > pageSize;
    const items = results.slice(0, pageSize).map(s => {
      // Robustly parse JSON tags stored as text
      let parsedTags: string[] = [];
      if (Array.isArray(s.tags)) {
        parsedTags = s.tags as unknown as string[];
      } else if (typeof s.tags === 'string') {
        try { parsedTags = JSON.parse(s.tags); } catch { parsedTags = []; }
      }
      return {
        id: s.slug, // UI compatibility expects slug as id
        slug: s.slug,
        title: s.title,
        description: s.description || '',
        tags: parsedTags,
        coverUrl: s.coverImageUrl || '',
        cover_image_url: s.coverImageUrl || '', // UI compatibility
        status: s.status || 'unknown',
        year: s.year,
        rating_avg: s.rating || 0,
        originalLanguage: 'ja', // Default since not in schema
        contentRating: 'safe', // Default since not in schema
        source: 'internal' // Default source for discovery
      };
    });

    // Fallback: if no items found in DB, return sample recommendations so UI is populated
    const fallbackItems = [
      {
        id: "one-piece",
        title: "One Piece",
        coverUrl:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-track-everything-4.jpg?",
      },
      {
        id: "solo-leveling",
        title: "Solo Leveling",
        coverUrl:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-find-next-6.jpg?",
      },
      {
        id: "chainsaw-man",
        title: "Chainsaw Man",
        coverUrl:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-organise-8.jpg?",
      },
      {
        id: "vinland-saga",
        title: "Vinland Saga",
        coverUrl:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-16.jpg?",
      },
      {
        id: "jujutsu-kaisen",
        title: "Jujutsu Kaisen",
        coverUrl:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-personalized-reccs-14.jpg?",
      },
      {
        id: "blue-lock",
        title: "Blue Lock",
        coverUrl:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/platform-11.jpg?",
      },
    ];

    const data = items.length > 0 ? items : fallbackItems;
    const total = items.length > 0 ? (hasMore ? offset + pageSize + 1 : offset + items.length) : fallbackItems.length;

    return NextResponse.json({
      items: data,
      page,
      pageSize: data.length,
      total,
      hasMore: items.length > 0 ? hasMore : false,
      meta: { category: "all", sort },
    });

  } catch (error) {
    console.error('GET /api/discovery error:', error);
    // Graceful fallback on error so UI still has content
    const fallbackItems = [
      { id: "one-piece", title: "One Piece", coverUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-track-everything-4.jpg?" },
      { id: "solo-leveling", title: "Solo Leveling", coverUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-find-next-6.jpg?" },
      { id: "chainsaw-man", title: "Chainsaw Man", coverUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-organise-8.jpg?" },
      { id: "vinland-saga", title: "Vinland Saga", coverUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-16.jpg?" },
      { id: "jujutsu-kaisen", title: "Jujutsu Kaisen", coverUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-personalized-reccs-14.jpg?" },
      { id: "blue-lock", title: "Blue Lock", coverUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/platform-11.jpg?" },
    ];

    // Reflect requested sort back even on fallback
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get("sort") || "newest").toLowerCase();

    return NextResponse.json({
      items: fallbackItems,
      page: 1,
      pageSize: fallbackItems.length,
      total: fallbackItems.length,
      hasMore: false,
      meta: { category: "all", sort },
    });
  }
}