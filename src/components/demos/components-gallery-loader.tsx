"use client";

import { useEffect, useMemo, useState } from "react";
import ComponentsGallery from "@/components/demos/components-gallery";

export const ComponentsGalleryLoader = () => {
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/series?page=1&pageSize=6`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Failed with ${res.status}`);
        }
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : data?.items ?? [];
        setItems(list);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setError(e?.message || "Failed to load series");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const galleryItems = useMemo(() => {
    const src = items ?? [];
    return src.slice(0, 6).map((s: any) => ({
      title: s.title || s.name || "Untitled",
      cover: s.coverUrl || s.image || s.cover_image_url || null,
      subtitle: Array.isArray(s.tags) ? s.tags.slice(0, 3).join(" • ") : undefined,
    }));
  }, [items]);

  return (
    <div className="container py-6">
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Loading components demo data…
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <div className="font-medium text-destructive">Unable to load demo data</div>
          <div className="mt-1 text-muted-foreground">{error}</div>
          <div className="mt-2">
            <button
              className="px-3 py-1.5 rounded-md border text-sm"
              onClick={() => {
                // optimistic retry
                setError(null);
                setLoading(true);
                const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
                fetch(`/api/series?page=1&pageSize=6`, {
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                })
                  .then(async (r) => {
                    if (!r.ok) throw new Error(await r.text());
                    return r.json();
                  })
                  .then((d) => {
                    const list: any[] = Array.isArray(d) ? d : d?.items ?? [];
                    setItems(list);
                  })
                  .catch((e) => setError(e?.message || "Failed to load series"))
                  .finally(() => setLoading(false));
              }}
            >Retry</button>
          </div>
        </div>
      )}

      <ComponentsGallery mockSeries={galleryItems} />
    </div>
  );
};

export default ComponentsGalleryLoader;