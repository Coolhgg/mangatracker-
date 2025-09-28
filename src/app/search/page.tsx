import Link from "next/link";
import { SearchControls } from "@/components/search/SearchControls";

interface SearchPageProps {
  searchParams?: {
    q?: string;
    sort?: string;
    status?: string;
    rating?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Server component — now wired to backend /api/search
  const query = typeof searchParams?.q === "string" ? searchParams?.q : "";
  const sort = typeof searchParams?.sort === "string" ? searchParams?.sort : "newest desc";
  const status = typeof searchParams?.status === "string" ? searchParams?.status : "";
  const rating = typeof searchParams?.rating === "string" ? searchParams?.rating : "";

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  // Keep collection consistent with backend default
  params.set("collection", "series");
  // Request a fuller grid of results
  params.set("per_page", "24");
  // include sort so backend applies selected ordering
  params.set("sort", sort);
  if (status) params.set("status", status);
  if (rating) params.set("rating", rating);

  let results: { hits: any[]; found: number; page: number; facet_counts: any[] } = {
    hits: [],
    found: 0,
    page: 1,
    facet_counts: [],
  };
  try {
    const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
    if (res.ok) {
      results = await res.json();
    }
  } catch {
    // ignore and keep empty results
  }

  const hits = Array.isArray((results as any)?.hits) ? (results as any).hits : [];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Search</h1>
          <p className="text-sm md:text-base text-muted-foreground">Browse the latest series and discover new reads.</p>
        </div>
      </header>

      {/* Interactive controls */}
      <SearchControls initialQuery={query} initialSort={sort} />

      {/* Results grid (empty state aware) */}
      <section className="mt-6 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Results</h2>
            {(results as any)?.found > 0 || hits.length > 0 ? (
              <p className="text-sm text-muted-foreground">{(results as any)?.found || hits.length} result(s) found.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to show yet. Try adjusting filters or check back later.</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {hits.length > 0 ? (
            hits.map((hit: any, i: number) => {
              const doc = hit?.document || {};
              const title = doc.title || doc.name || "Untitled";
              const cover = doc.cover || doc.image || doc.image_url || doc.thumbnail || "";
              const slug = doc.slug || doc.id || doc._id || "";
              const Card = (
                <div className="group overflow-hidden rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="aspect-[3/4] w-full bg-muted/40 overflow-hidden">
                    {cover ? (
                      // Using <img> to avoid remotePatterns config requirements
                      <img
                        src={cover}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-2 text-xs font-medium leading-snug">{title}</p>
                    {doc.author ? (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{doc.author}</p>
                    ) : null}
                  </div>
                </div>
              );
              return slug ? (
                <Link key={doc.id || slug || i} href={`/series/${encodeURIComponent(slug)}`} prefetch>
                  {Card}
                </Link>
              ) : (
                <div key={doc.id || i}>{Card}</div>
              );
            })
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