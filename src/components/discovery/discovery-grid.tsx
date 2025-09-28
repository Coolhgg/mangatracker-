"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TrackButton } from "@/components/discovery/track-button";
import Link from "next/link";

export interface DiscoveryItem {
  id: string;
  title?: string;
  coverUrl?: string;
}

interface Props {
  initialItems: DiscoveryItem[];
  initialPage: number;
  pageSize: number;
  initialHasMore: boolean;
  // optional additional query string (e.g., "sort=newest&status=ongoing") to be appended to API requests
  extraQuery?: string;
}

// Normalize any API payload item shape into DiscoveryItem
function normalize(items: any[] = []): DiscoveryItem[] {
  return items.map((it: any) => ({
    id: String(it?.id ?? it?.slug ?? it?.externalId ?? ""),
    title: it?.title ?? it?.name ?? "",
    coverUrl: it?.coverUrl ?? it?.cover_url ?? it?.cover_image_url ?? it?.coverImageUrl ?? undefined,
  })).filter((x) => x.id);
}

export const DiscoveryGrid = ({ initialItems, initialPage, pageSize, initialHasMore, extraQuery }: Props) => {
  const [items, setItems] = useState<DiscoveryItem[]>(normalize(initialItems) || []);
  const [page, setPage] = useState<number>(initialPage || 1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const totalSoFar = useMemo(() => items.length, [items.length]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      // If we currently have no items, start from page 1; otherwise increment
      const nextPage = (items.length === 0 ? 1 : page + 1);
      const qs = extraQuery ? `&${extraQuery}` : "";
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch(`/api/discovery?page=${nextPage}&pageSize=${pageSize}${qs}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const newItems = Array.isArray(data.items) ? normalize(data.items) : [];
      setItems((prev) => [...prev, ...newItems]);
      setPage(data.page ?? nextPage);
      // Support both shapes from different backends
      setHasMore(Boolean((data.hasMore ?? data.hasNextPage)));
    } catch (e: any) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, hasMore, loading, extraQuery, items.length]);

  // Auto-load first page when mounted with empty items (e.g., after filters change)
  useEffect(() => {
    if (items.length === 0 && hasMore && !loading) {
      // initial empty -> request page 1
      loadMore();
    }
  }, [items.length, hasMore, loading, loadMore]);

  // Infinite scroll: auto-load when sentinel enters viewport
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          // Debounced by loading/hasMore checks inside loadMore
          loadMore();
        }
      },
      { root: null, rootMargin: "1000px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, [loadMore]);

  return (
    <section className="mt-6 rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Recommendations</h2>
          {items.length > 0 ? (
            <p className="text-sm text-muted-foreground">{totalSoFar} recommendation(s) loaded.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to show yet. Start tracking to get personalized picks.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="group relative aspect-[2/3] overflow-hidden rounded-md border bg-muted/40">
              <Link
                href={`/series/${encodeURIComponent(item.id)}`}
                className="absolute inset-0"
              >
                {item?.coverUrl ? (
                  <img
                    src={`/api/image-proxy?src=${encodeURIComponent(item.coverUrl)}`}
                    alt={item.title || "Cover"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs text-white drop-shadow">{item?.title || "Untitled"}</p>
                </div>
              </Link>
              <div className="absolute right-2 top-2 z-10">
                <TrackButton source="mangadex" sourceSeriesId={item.id} />
              </div>
            </div>
          ))
        ) : (
          [...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-md border bg-muted/40" />
          ))
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} aria-hidden="true" />

      <div className="mt-6 flex items-center gap-3">
        {error && <span className="text-sm text-destructive">{error}</span>}
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : (
          items.length > 0 && (
            <span className="text-sm text-muted-foreground">You're all caught up.</span>
          )
        )}
      </div>
    </section>
  );
};