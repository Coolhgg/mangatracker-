"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LibraryItem = {
  id: string | number;
  title?: string;
  name?: string;
  coverUrl?: string | null;
  image?: string | null;
  latestChapter?: string | number | null;
  progress?: number | null;
  unreadCount?: number | null;
  source?: string | null;
};

export const LibraryClient = ({
  items: initialItems,
  mockOnly = false,
}: {
  items?: LibraryItem[];
  mockOnly?: boolean;
}) => {
  const [items, setItems] = useState<LibraryItem[] | null>(initialItems ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In mock-only mode or when initial items are provided, skip any network fetches
    if (mockOnly || (initialItems && initialItems.length >= 0)) {
      setLoading(false);
      setError(null);
      setItems(initialItems ?? []);
      return;
    }
    const controller = new AbortController();
    const token = localStorage.getItem("bearer_token");

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/library", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        // Accept either { items: [...] } or an array directly
        const list: LibraryItem[] = Array.isArray(data) ? data : data?.items ?? [];
        setItems(list);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setError(e?.message || "Failed to load library");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [initialItems, mockOnly]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Loading your library...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Unable to load library</p>
          <p className="mt-1 text-muted-foreground">{error}</p>
          <button
            onClick={() => {
              if (mockOnly) return; // no-op in mock mode
              // simple retry
              setLoading(true);
              setError(null);
              setItems(null);
              // trigger effect by updating a dummy state or just refetch inline
              const token = localStorage.getItem("bearer_token");
              fetch("/api/library", {
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              })
                .then(async (r) => {
                  if (!r.ok) throw new Error(await r.text());
                  const d = await r.json();
                  const list: LibraryItem[] = Array.isArray(d) ? d : d?.items ?? [];
                  setItems(list);
                })
                .catch((e) => setError(e?.message || "Failed to load library"))
                .finally(() => setLoading(false));
            }}
            className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Your library is empty.</p>
          <Link
            href="/discovery"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90"
          >
            Start discovering
          </Link>
        </div>
      );
    }

    return (
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((it) => {
          const title = it.title || it.name || "Untitled";
          const img = (it.coverUrl || it.image) ?? null;
          const latest = it.latestChapter ?? null;
          const progress = it.progress ?? null;
          const unread = it.unreadCount ?? null;
          return (
            <li key={String(it.id)} className="group rounded-lg border bg-card shadow-sm transition hover:shadow-md">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-t-lg bg-muted">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={title}
                    src={img}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No cover</div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium">{title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  {progress !== null ? <span>Progress: {progress}</span> : <span />}
                  {typeof unread === "number" && unread > 0 ? (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">{unread} unread</span>
                  ) : null}
                </div>
                {latest !== null ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">Latest: {String(latest)}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }, [error, items, loading, mockOnly]);

  return <div className="w-full">{content}</div>;
};