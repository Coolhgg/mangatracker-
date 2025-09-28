"use client";

import { useEffect, useState } from "react";

interface SeriesStatsResponse {
  seriesId: number;
  userId: number;
  totalChapters: number;
  readChapters: number;
  lastReadChapter?: {
    id: number;
    number: number;
    title?: string | null;
    readAt?: string | null;
  };
  libraryEntry?: {
    id: number;
    status?: string | null;
    rating?: number | null;
    notes?: string | null;
  };
  progress: {
    percentage: number;
    isUpToDate: boolean;
  };
}

export const SeriesStats = ({ slug }: { slug: string }) => {
  const [data, setData] = useState<SeriesStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(`/api/series/${encodeURIComponent(slug)}/progress`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });
        if (res.status === 401) {
          if (!cancelled) setUnauthorized(true);
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load stats (${res.status})`);
        }
        const j = (await res.json()) as SeriesStatsResponse;
        if (!cancelled) setData(j);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <section className="mt-6 rounded-md border bg-card p-4">
      <h3 className="mb-2 text-base font-semibold">Reading Stats</h3>
      {loading ? (
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      ) : unauthorized ? (
        <p className="text-sm text-muted-foreground">Sign in to view your reading stats.</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : data ? (
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <div className="text-muted-foreground">Total chapters</div>
            <div className="font-medium">{data.totalChapters}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Read chapters</div>
            <div className="font-medium">{data.readChapters}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Progress</div>
            <div className="font-medium">{data.progress?.percentage ?? 0}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Up to date</div>
            <div className="font-medium">{data.progress?.isUpToDate ? "Yes" : "No"}</div>
          </div>
          <div className="col-span-2 md:col-span-4">
            <div className="text-muted-foreground">Last read</div>
            <div className="font-medium">
              {data.lastReadChapter ? (
                <>Chapter {data.lastReadChapter.number}{data.lastReadChapter.title ? `: ${data.lastReadChapter.title}` : ""}</>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No stats yet.</p>
      )}
    </section>
  );
};

export default SeriesStats;