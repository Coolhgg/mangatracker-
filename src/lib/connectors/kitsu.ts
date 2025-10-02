import type { Connector, SeriesItem, ChapterItem, ConnectorHealth } from "./types";

const KITSU_API = "https://kitsu.io/api/edge";

export const KitsuConnector: Connector = {
  id: "kitsu",
  name: "Kitsu",

  async fetchSeriesList(pagination) {
    const limit = pagination?.limit ?? 20;
    const offset = ((pagination?.page ?? 1) - 1) * limit;

    const response = await fetch(
      `${KITSU_API}/manga?page[limit]=${limit}&page[offset]=${offset}&sort=-favoritesCount`,
      { cache: "no-store" }
    );

    if (!response.ok) return [];

    const json = await response.json();
    const data = json?.data || [];

    return data.map((m: any) => ({
      id: m.id,
      title: m.attributes?.canonicalTitle || m.attributes?.titles?.en || "",
      altTitles: Object.values(m.attributes?.titles || {}).filter((t: any) => typeof t === "string") as string[],
      description: m.attributes?.synopsis || "",
      tags: m.attributes?.categories || [],
      coverUrl: m.attributes?.posterImage?.large || m.attributes?.posterImage?.medium,
      language: "en",
    })) as SeriesItem[];
  },

  async fetchSeriesMetadata(sourceSeriesId) {
    const response = await fetch(`${KITSU_API}/manga/${sourceSeriesId}`, { cache: "no-store" });

    if (!response.ok) return null;

    const json = await response.json();
    const m = json?.data;
    if (!m) return null;

    return {
      id: m.id,
      title: m.attributes?.canonicalTitle || m.attributes?.titles?.en || "",
      altTitles: Object.values(m.attributes?.titles || {}).filter((t: any) => typeof t === "string") as string[],
      description: m.attributes?.synopsis || "",
      tags: m.attributes?.categories || [],
      coverUrl: m.attributes?.posterImage?.large || m.attributes?.posterImage?.medium,
      language: "en",
    } as SeriesItem;
  },

  async fetchChapters(sourceSeriesId, pagination) {
    const limit = pagination?.limit ?? 20;
    const offset = ((pagination?.page ?? 1) - 1) * limit;

    const response = await fetch(
      `${KITSU_API}/manga/${sourceSeriesId}/chapters?page[limit]=${limit}&page[offset]=${offset}&sort=number`,
      { cache: "no-store" }
    );

    if (!response.ok) return [];

    const json = await response.json();
    const data = json?.data || [];

    return data.map((c: any) => ({
      id: c.id,
      title: c.attributes?.canonicalTitle || undefined,
      number: c.attributes?.number ? parseFloat(c.attributes.number) : undefined,
      publishedAt: c.attributes?.published,
      url: c.attributes?.url || undefined,
    })) as ChapterItem[];
  },

  async fetchChapterContent(_sourceChapterId) {
    return null;
  },

  async healthCheck() {
    try {
      const response = await fetch(`${KITSU_API}/manga?page[limit]=1`, { cache: "no-store" });
      return { ok: response.ok, message: response.ok ? "ok" : `status ${response.status}` };
    } catch (e: any) {
      return { ok: false, message: e?.message || "network error" };
    }
  },
};