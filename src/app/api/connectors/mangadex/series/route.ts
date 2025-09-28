import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.mangadex.org";
const UPLOADS = "https://uploads.mangadex.org";

// GET /api/connectors/mangadex/series?page=1&limit=24&sort=newest&status=ongoing&status=completed&contentRating=safe
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 24);

  // Optional filters
  const sort = (searchParams.get("sort") || "newest").toLowerCase();
  const status = searchParams.getAll("status"); // ongoing, completed, hiatus, cancelled
  const contentRatings = searchParams.getAll("contentRating"); // safe, suggestive, erotica, pornographic
  // New filters
  const type = (searchParams.get("type") || "").toLowerCase(); // manga | manhwa | manhua (mapped to originalLanguage)
  const readableOn = searchParams.getAll("readableOn"); // availableTranslatedLanguage[] (e.g., en, es, fr, pt-br)
  const year = searchParams.get("year"); // exact publication year
  const period = (searchParams.get("period") || "").toLowerCase(); // 7d | 30d | 365d
  const tags = searchParams.getAll("tag"); // pass-through: includedTags[] (expects MangaDex tag IDs)

  const offset = (page - 1) * limit;

  // Map sort -> MangaDex order parameter
  const orderParams: Record<string, string> = {
    newest: "createdAt:desc",
    oldest: "createdAt:asc",
    updated: "updatedAt:desc",
    latest_chapter: "latestUploadedChapter:desc",
    most_followed: "followedCount:desc",
    highest_rated: "rating:desc",
  };
  const order = orderParams[sort] || orderParams["newest"];
  const [orderKey, orderDir] = order.split(":");

  try {
    const url = new URL(`${BASE}/manga`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.append("includes[]", "cover_art");
    // Apply order
    url.searchParams.append(`order[${orderKey}]`, orderDir);
    // Apply status filters
    status.forEach((s) => url.searchParams.append("status[]", s));
    // Apply content rating filters
    contentRatings.forEach((cr) => url.searchParams.append("contentRating[]", cr));

    // Map type -> originalLanguage
    if (type === "manga") url.searchParams.append("originalLanguage[]", "ja");
    if (type === "manhwa") url.searchParams.append("originalLanguage[]", "ko");
    if (type === "manhua") url.searchParams.append("originalLanguage[]", "zh");

    // Readable On -> availableTranslatedLanguage[]
    readableOn.forEach((lang) => url.searchParams.append("availableTranslatedLanguage[]", lang));

    // Release year
    if (year) url.searchParams.set("year", year);

    // Release period -> createdAtSince (ISO timestamp)
    if (period) {
      const now = new Date();
      let since: Date | null = null;
      if (period === "7d") since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (period === "30d") since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      else if (period === "365d") since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      if (since) url.searchParams.set("createdAtSince", since.toISOString());
    }

    // Tags (IDs) passthrough
    tags.forEach((t) => url.searchParams.append("includedTags[]", t));
    if (tags.length > 0) url.searchParams.set("includedTagsMode", "AND");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ items: [], page, limit, total: 0, hasMore: false }, { status: 200 });
    }
    const data = await res.json();
    const raw = Array.isArray(data?.data) ? data.data : [];

    const items = raw.map((m: any) => {
      const rels = Array.isArray(m?.relationships) ? m.relationships : [];
      const cover = rels.find((r: any) => r?.type === "cover_art");
      const fileName = cover?.attributes?.fileName;
      const coverUrl = fileName ? `${UPLOADS}/covers/${m?.id}/${fileName}` : undefined;
      return {
        id: m?.id,
        title: m?.attributes?.title?.en || Object.values(m?.attributes?.title || {})[0] || "",
        altTitles: (m?.attributes?.altTitles || []).map((a: any) => Object.values(a)[0]).filter(Boolean),
        description: m?.attributes?.description?.en || Object.values(m?.attributes?.description || {})[0] || "",
        tags: (m?.attributes?.tags || []).map((t: any) => t?.attributes?.name?.en).filter(Boolean),
        language: m?.attributes?.originalLanguage,
        coverUrl,
      };
    });

    const hasMore = items.length === limit;
    return NextResponse.json({ items, page, limit, total: items.length, hasMore }, { status: 200 });
  } catch (e) {
    console.error("[mangadex series] error:", e);
    return NextResponse.json({ items: [], page, limit, total: 0, hasMore: false }, { status: 200 });
  }
}