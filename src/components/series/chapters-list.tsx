"use client";

import { useEffect, useMemo, useState } from "react";
import MarkReadButton from "@/components/series/mark-read-button";
import Link from "next/link";

type Chapter = {
  id: string | number;
  number: number;
  title: string;
  language?: string;
  publishedAt?: string | null;
  pages?: number;
  url: string; // external reader URL
};

export const ChaptersList = ({ slug }: { slug: string }) => {
  const [items, setItems] = useState<Chapter[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const endpoint = useMemo(() => `/api/series/${encodeURIComponent(slug)}/chapters?page=${page}&limit=20`, [slug, page]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });
        if (res.status === 401) {
          if (!cancelled) {
            setUnauthorized(true);
          }
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load chapters (${res.status})`);
        }
        const data = await res.json();
        const newItems: Chapter[] = (data.items || []).map((c: any) => ({
          id: String(c.id ?? c.externalId ?? Math.random()),
          number: Number(c.number ?? 0),
          title: String(c.title ?? `Chapter ${c.number ?? "?"}`),
          language: c.language || "en",
          publishedAt: c.publishedAt ?? null,
          pages: c.pages ?? undefined,
          url: String(c.url),
        }));
        if (cancelled) return;
        setItems(prev => (page === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(Boolean(data.hasMore));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load chapters");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [endpoint, page]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    setPage(p => p + 1);
  };

  if (unauthorized) {
    return (
      <div className="mt-6 rounded-md border bg-card p-4">
        <h3 className="mb-1 text-base font-semibold">Sign in to view chapters</h3>
        <p className="text-sm text-muted-foreground">
          Chapters are available after logging in. Please log in or create an account.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/login" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Log in</Link>
          <Link href="/register" className="inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-sm text-background hover:bg-foreground/90">Register</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-md border bg-card p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-xl font-semibold">Chapters</h2>
      <div className="divide-y rounded-md border">
        {items.length === 0 && !loading ? (
          <div className="p-4 text-sm text-muted-foreground">No chapters found.</div>
        ) : null}
        {items.map((ch) => (
          <div key={String(ch.id)} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="truncate font-medium">Chapter {ch.number}: {ch.title}</div>
              <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-2">
                {ch.language ? <span>Lang: {ch.language}</span> : null}
                {ch.pages ? <span>{ch.pages} pages</span> : null}
                {ch.publishedAt ? <span>{new Date(ch.publishedAt).toLocaleDateString()}</span> : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                Read externally ↗
              </a>
              <MarkReadButton chapterId={String(ch.id)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center">
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-md bg-secondary px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">End of list</span>
        )}
      </div>
    </div>
  );
};

export default ChaptersList;