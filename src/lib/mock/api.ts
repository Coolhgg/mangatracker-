// Mock API helpers and dataset
// Note: Keep this purely in-memory for PHASE-1 wiring.

export type DiscoveryFilters = {
  tags?: string[];
  status?: ("ongoing" | "completed" | "hiatus" | "cancelled" | string) | ("ongoing" | "completed" | "hiatus" | "cancelled" | string)[];
  source?: string;
  q?: string;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  url?: string;
};

export type Series = {
  id: string; // can be same as slug for mock
  slug: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  status?: string;
  tags: string[];
  rating_avg?: number;
  year?: number;
  source?: string;
  chapters: Chapter[];
};

// Build 12+ realistic mock series with 10–30 chapters each
function makeChapters(slug: string, count: number): Chapter[] {
  return Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return {
      id: `${slug}-ch-${num}`,
      number: num,
      title: `Chapter ${num}`,
      url: `https://example.org/read/${slug}/${num}`,
    };
  }).reverse(); // newest first
}

const covers = [
  "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
];

// Base curated series
const BASE_SERIES: Series[] = [
  {
    id: "one-piece",
    slug: "one-piece",
    title: "One Piece",
    description: "A tale of pirates seeking the ultimate treasure, the One Piece.",
    cover_image_url: covers[0],
    status: "ongoing",
    tags: ["action", "adventure", "comedy"],
    rating_avg: 9.2,
    year: 1997,
    source: "mock",
    chapters: makeChapters("one-piece", 30),
  },
  {
    id: "attack-on-titan",
    slug: "attack-on-titan",
    title: "Attack on Titan",
    description: "Humanity fights for survival against mysterious Titans.",
    cover_image_url: covers[1],
    status: "completed",
    tags: ["action", "drama", "fantasy", "horror"],
    rating_avg: 9.0,
    year: 2009,
    source: "mock",
    chapters: makeChapters("attack-on-titan", 25),
  },
  {
    id: "demon-slayer",
    slug: "demon-slayer",
    title: "Demon Slayer",
    description: "A boy becomes a demon slayer to save his sister.",
    cover_image_url: covers[2],
    status: "completed",
    tags: ["action", "supernatural", "drama"],
    rating_avg: 8.7,
    year: 2016,
    source: "mock",
    chapters: makeChapters("demon-slayer", 23),
  },
  {
    id: "naruto",
    slug: "naruto",
    title: "Naruto",
    description: "A young ninja seeks recognition and dreams of becoming Hokage.",
    cover_image_url: covers[3],
    status: "completed",
    tags: ["action", "adventure", "comedy", "drama"],
    rating_avg: 8.5,
    year: 1999,
    source: "mock",
    chapters: makeChapters("naruto", 30),
  },
  {
    id: "my-hero-academia",
    slug: "my-hero-academia",
    title: "My Hero Academia",
    description: "In a world of heroes and quirks, a boy without powers aims high.",
    cover_image_url: covers[4],
    status: "ongoing",
    tags: ["action", "adventure", "comedy", "sci-fi"],
    rating_avg: 8.3,
    year: 2014,
    source: "mock",
    chapters: makeChapters("my-hero-academia", 22),
  },
  {
    id: "fullmetal-alchemist",
    slug: "fullmetal-alchemist",
    title: "Fullmetal Alchemist",
    description: "Two brothers search for the Philosopher's Stone after a failed ritual.",
    cover_image_url: covers[5],
    status: "completed",
    tags: ["adventure", "drama", "fantasy"],
    rating_avg: 9.1,
    year: 2001,
    source: "mock",
    chapters: makeChapters("fullmetal-alchemist", 27),
  },
  {
    id: "jujutsu-kaisen",
    slug: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    description: "A student swallows a cursed object and joins sorcerers to fight curses.",
    cover_image_url: covers[0],
    status: "ongoing",
    tags: ["action", "supernatural", "school"],
    rating_avg: 8.6,
    year: 2018,
    source: "mock",
    chapters: makeChapters("jujutsu-kaisen", 24),
  },
  {
    id: "bleach",
    slug: "bleach",
    title: "Bleach",
    description: "A teenager becomes a Soul Reaper, defending humans from evil spirits.",
    cover_image_url: covers[1],
    status: "completed",
    tags: ["action", "supernatural", "adventure"],
    rating_avg: 8.0,
    year: 2001,
    source: "mock",
    chapters: makeChapters("bleach", 28),
  },
  {
    id: "chainsaw-man",
    slug: "chainsaw-man",
    title: "Chainsaw Man",
    description: "A boy merges with a devil and becomes Chainsaw Man.",
    cover_image_url: covers[2],
    status: "ongoing",
    tags: ["action", "horror", "dark"],
    rating_avg: 8.4,
    year: 2018,
    source: "mock",
    chapters: makeChapters("chainsaw-man", 21),
  },
  {
    id: "vinland-saga",
    slug: "vinland-saga",
    title: "Vinland Saga",
    description: "A Viking epic of revenge and redemption.",
    cover_image_url: covers[3],
    status: "ongoing",
    tags: ["drama", "historical", "adventure"],
    rating_avg: 8.9,
    year: 2005,
    source: "mock",
    chapters: makeChapters("vinland-saga", 26),
  },
  {
    id: "spy-x-family",
    slug: "spy-x-family",
    title: "SPY×FAMILY",
    description: "A spy builds a fake family, unaware they each have secrets.",
    cover_image_url: covers[4],
    status: "ongoing",
    tags: ["comedy", "slice-of-life", "action"],
    rating_avg: 8.2,
    year: 2019,
    source: "mock",
    chapters: makeChapters("spy-x-family", 18),
  },
];

// Generate additional mock series to ensure >= 24 results for pagination tests
const GENERATED_SERIES: Series[] = Array.from({ length: 16 }, (_, i) => {
  const idx = i + 1; // 1..16
  const slug = `mock-series-${idx}`;
  const year = 2000 + ((idx * 3) % 24);
  const ongoing = idx % 2 === 0;
  const tagPools = [
    ["action", "adventure"],
    ["drama", "fantasy"],
    ["comedy", "school"],
    ["sci-fi", "mecha"],
    ["romance", "slice-of-life"],
    ["horror", "psychological"],
  ];
  const tags = tagPools[idx % tagPools.length];
  return {
    id: slug,
    slug,
    title: `Mock Series ${idx}`,
    description: `Generated mock series #${idx} for discovery pagination and filters.`,
    cover_image_url: covers[idx % covers.length],
    status: ongoing ? "ongoing" : "completed",
    tags,
    rating_avg: 7.0 + ((idx % 10) / 10),
    year,
    source: "mock",
    chapters: makeChapters(slug, 10 + (idx % 21)),
  } as Series;
});

export const MOCK_SERIES: Series[] = [...BASE_SERIES, ...GENERATED_SERIES];

export async function getDiscoveryResults({
  filters = {},
  page = 1,
  limit = 20,
}: {
  filters?: DiscoveryFilters;
  page?: number;
  limit?: number;
}) {
  let items = [...MOCK_SERIES];
  const { tags, status, source, q } = filters;

  if (status) {
    if (Array.isArray(status)) {
      const set = new Set(status.map((s) => s.toLowerCase()));
      items = items.filter((s) => set.has((s.status || "").toLowerCase()));
    } else {
      items = items.filter((s) => (s.status || "").toLowerCase() === status.toLowerCase());
    }
  }
  if (source) items = items.filter((s) => (s.source || "").toLowerCase() === source.toLowerCase());
  if (q && q.trim()) {
    const ql = q.toLowerCase();
    items = items.filter(
      (s) => s.title.toLowerCase().includes(ql) || s.slug.toLowerCase().includes(ql) || s.tags.some((t) => t.toLowerCase().includes(ql))
    );
  }
  if (tags && tags.length) {
    const set = new Set(tags.map((t) => t.toLowerCase()));
    items = items.filter((s) => s.tags.some((t) => set.has(t.toLowerCase())));
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = items.slice(start, end).map((s) => ({
    id: s.slug, // expose slug as id for grid links
    slug: s.slug,
    title: s.title,
    cover_image_url: s.cover_image_url,
  }));

  return {
    items: paged,
    page,
    limit,
    total,
    hasNextPage: end < total,
  };
}

export async function getSeriesBySlug(slug: string) {
  const s = MOCK_SERIES.find((x) => x.slug === slug);
  if (!s) return null;
  return s;
}