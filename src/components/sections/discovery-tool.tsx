import { TrackButton } from "@/components/discovery/track-button";
import Link from "next/link";

export default async function DiscoveryTool() {
  // Server component: fetch from backend /api/discovery and render empty-aware UI
  let data: { items: any[]; page: number; pageSize: number; total: number; hasMore: boolean; meta: { category: string; sort: string } } = {
    items: [],
    page: 1,
    pageSize: 24,
    total: 0,
    hasMore: false,
    meta: { category: "all", sort: "newest" },
  };

  try {
    // Prefer env-based absolute URL to stay compatible with static generation
    const base = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

    if (base) {
      const res = await fetch(`${base}/api/discovery`, { cache: "no-store" });
      if (res.ok) {
        data = await res.json();
      }
    }
  } catch {
    // keep defaults
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Discovery</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Find new series based on your taste.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent" disabled>
            Filters
          </button>
          <button className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent" disabled>
            Sort: Newest
          </button>
        </div>
      </header>

      {/* Category tabs placeholder */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {["All", "Manga", "Manhwa", "Manhua", "Webtoon"].map((t) => (
          <span
            key={t}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground select-none"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Results grid */}
      <section className="mt-6 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Recommendations</h2>
            {data.items.length > 0 ? (
              <p className="text-sm text-muted-foreground">{data.items.length} recommendation(s) found.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to show yet. Start tracking to get personalized picks.</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.items.length > 0 ? (
            data.items.map((item: any) => (
              <div key={item.id} className="group relative overflow-hidden rounded-md border bg-muted/40">
                <Link href={`/series/${item.id}`} className="block aspect-[3/4]">
                  {item?.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverUrl} alt={item.title || "Cover"} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </Link>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs text-white drop-shadow">{item?.title || "Untitled"}</p>
                </div>
                <div className="absolute right-2 top-2">
                  {/* Align source name to backend expectation */}
                  <TrackButton source="mangadx" sourceSeriesId={item.id} />
                </div>
              </div>
            ))
          ) : (
            [...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-md border bg-muted/40" />
            ))
          )}
        </div>
      </section>
    </div>
  );
}