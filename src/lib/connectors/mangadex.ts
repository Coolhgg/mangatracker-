import type { Connector, Pagination, SeriesItem, ChapterItem, ConnectorHealth } from "./types";

const BASE = "https://api.mangadex.org";
const UPLOADS = "https://uploads.mangadex.org";

export const MangaDexConnector: Connector = {
  id: "mangadex",
  name: "MangaDex",
  async fetchSeriesList(pagination?: Pagination): Promise<SeriesItem[]> {
    const limit = pagination?.limit ?? 20;
    const offset = ((pagination?.page ?? 1) - 1) * limit;
    const res = await fetch(`${BASE}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data || []).map((m: any) => {
      const rels = Array.isArray(m?.relationships) ? m.relationships : [];
      const cover = rels.find((r: any) => r?.type === "cover_art");
      const fileName = cover?.attributes?.fileName;
      // Use original cover file to match MangaDex exactly (no size suffix)
      const coverUrl = fileName ? `${UPLOADS}/covers/${m?.id}/${fileName}` : undefined;
      return {
        id: m?.id,
        title: m?.attributes?.title?.en || Object.values(m?.attributes?.title || {})[0] || "",
        altTitles: (m?.attributes?.altTitles || []).map((a: any) => Object.values(a)[0]).filter(Boolean),
        description: m?.attributes?.description?.en || Object.values(m?.attributes?.description || {})[0] || "",
        tags: (m?.attributes?.tags || []).map((t: any) => t?.attributes?.name?.en).filter(Boolean),
        language: m?.attributes?.originalLanguage,
        coverUrl,
      } as SeriesItem;
    });
  },
  async fetchSeriesMetadata(sourceSeriesId: string): Promise<SeriesItem | null> {
    const res = await fetch(`${BASE}/manga/${sourceSeriesId}?includes[]=cover_art`, { cache: "no-store" });
    if (!res.ok) return null;
    const m = (await res.json())?.data;
    if (!m) return null;
    const rels = Array.isArray(m?.relationships) ? m.relationships : [];
    const cover = rels.find((r: any) => r?.type === "cover_art");
    const fileName = cover?.attributes?.fileName;
    // Use original cover file to match MangaDex exactly (no size suffix)
    const coverUrl = fileName ? `${UPLOADS}/covers/${m?.id}/${fileName}` : undefined;
    return {
      id: m.id,
      title: m?.attributes?.title?.en || Object.values(m?.attributes?.title || {})[0] || "",
      altTitles: (m?.attributes?.altTitles || []).map((a: any) => Object.values(a)[0]).filter(Boolean),
      description: m?.attributes?.description?.en || Object.values(m?.attributes?.description || {})[0] || "",
      tags: (m?.attributes?.tags || []).map((t: any) => t?.attributes?.name?.en).filter(Boolean),
      language: m?.attributes?.originalLanguage,
      coverUrl,
    } as SeriesItem;
  },
  async fetchChapters(sourceSeriesId: string, pagination?: Pagination): Promise<ChapterItem[]> {
    const limit = pagination?.limit ?? 20;
    const offset = ((pagination?.page ?? 1) - 1) * limit;
    const res = await fetch(`${BASE}/chapter?manga=${sourceSeriesId}&limit=${limit}&offset=${offset}&translatedLanguage[]=en`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data || []).map((c: any) => ({
      id: c?.id,
      title: c?.attributes?.title || undefined,
      number: parseFloat(c?.attributes?.chapter) || undefined,
      publishedAt: c?.attributes?.publishAt || c?.attributes?.createdAt,
      url: `https://mangadex.org/chapter/${c?.id}`,
    }));
  },
  async fetchChapterContent(_sourceChapterId: string): Promise<{ images: string[] } | null> {
    // Content fetching is often protected; placeholder only
    return { images: [] };
  },
  async healthCheck(): Promise<ConnectorHealth> {
    try {
      const res = await fetch(`${BASE}/ping`, { cache: "no-store" });
      return { ok: res.ok, message: res.ok ? "ok" : `status ${res.status}` };
    } catch (e: any) {
      return { ok: false, message: e?.message || "network error" };
    }
  }
};