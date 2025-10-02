import type { Connector, SeriesItem, ChapterItem, ConnectorHealth } from "./types";

const ANILIST_API = "https://graphql.anilist.co";

export const AniListConnector: Connector = {
  id: "anilist",
  name: "AniList",
  
  async fetchSeriesList(pagination) {
    const limit = pagination?.limit ?? 20;
    const page = pagination?.page ?? 1;
    
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: MANGA, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
            }
            genres
            tags {
              name
            }
            startDate {
              year
            }
            status
          }
        }
      }
    `;

    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { page, perPage: limit },
      }),
    });

    if (!response.ok) return [];

    const json = await response.json();
    const media = json?.data?.Page?.media || [];

    return media.map((m: any) => ({
      id: String(m.id),
      title: m.title?.english || m.title?.romaji || m.title?.native || "",
      altTitles: [m.title?.romaji, m.title?.native].filter(Boolean),
      description: m.description?.replace(/<[^>]*>/g, "") || "",
      tags: [...(m.genres || []), ...(m.tags || []).map((t: any) => t.name)],
      coverUrl: m.coverImage?.large,
      language: "en",
    })) as SeriesItem[];
  },

  async fetchSeriesMetadata(sourceSeriesId) {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
          }
          genres
          tags {
            name
          }
          startDate {
            year
          }
          status
        }
      }
    `;

    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { id: parseInt(sourceSeriesId) },
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const m = json?.data?.Media;
    if (!m) return null;

    return {
      id: String(m.id),
      title: m.title?.english || m.title?.romaji || m.title?.native || "",
      altTitles: [m.title?.romaji, m.title?.native].filter(Boolean),
      description: m.description?.replace(/<[^>]*>/g, "") || "",
      tags: [...(m.genres || []), ...(m.tags || []).map((t: any) => t.name)],
      coverUrl: m.coverImage?.large,
      language: "en",
    } as SeriesItem;
  },

  async fetchChapters(_sourceSeriesId, _pagination) {
    // AniList doesn't provide chapter-level data
    return [] as ChapterItem[];
  },

  async fetchChapterContent(_sourceChapterId) {
    return null;
  },

  async healthCheck() {
    try {
      const response = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ Media(id: 1) { id } }" }),
      });
      return { ok: response.ok, message: response.ok ? "ok" : `status ${response.status}` };
    } catch (e: any) {
      return { ok: false, message: e?.message || "network error" };
    }
  },
};