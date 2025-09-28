"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { DiscoverySection } from "@/components/discovery/discovery-section";

export type DiscoveryItem = {
  id: number | string;
  slug: string;
  title: string;
  coverImageUrl?: string;
};

export const DiscoveryLoader = () => {
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isLoading = loading || isPending;

  const fetchPage = async (nextPage: number) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/discovery?page=${nextPage}&pageSize=${pageSize}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Failed to load discovery (${res.status})`);
      }
      const data = await res.json();
      const newItems: DiscoveryItem[] = (data.items || []).map((s: any) => ({
        id: s.id ?? s.slug,
        slug: s.slug,
        title: s.title,
        coverImageUrl: s.coverUrl ?? s.coverImageUrl ?? s.cover_image_url,
      }));
      setItems((prev) => (nextPage === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(Boolean(data.hasMore));
      setPage(nextPage);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sectionProps = useMemo(() => ({
    initialItems: items,
    initialPage: page,
    pageSize,
    initialHasMore: hasMore,
  }), [items, page, pageSize, hasMore]);

  return (
    <div className="w-full">
      {error ? (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <DiscoverySection {...sectionProps} />
    </div>
  );
};

export default DiscoveryLoader;