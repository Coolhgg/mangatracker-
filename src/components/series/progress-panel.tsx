"use client";

import { useEffect, useState } from "react";

type ProgressResponse = {
  lastReadChapterId: number | null;
  lastReadAt: string | null;
  currentPage: number | null;
  completed: boolean | null;
};

export const ProgressPanel = ({ slug }: { slug: string }) => {
  const [data, setData] = useState<ProgressResponse | null>(null);
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
        const res = await fetch(`/api/series/${encodeURIComponent(slug)}/reading-progress`, {
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
          throw new Error(text || `Failed to load progress (${res.status})`);
        }
        const j = (await res.json()) as ProgressResponse;
        if (!cancelled) setData(j);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load progress");
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
      <h3 className="mb-2 text-base font-semibold">Your Progress</h3>
      {loading ? (
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      ) : unauthorized ? (
        <p className="text-sm text-muted-foreground">
          Sign in to see your reading progress.
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : data ? (
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Last read chapter:</span>{" "}
            <span>{data.lastReadChapterId ?? "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last read at:</span>{" "}
            <span>{data.lastReadAt ? new Date(data.lastReadAt).toLocaleString() : "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Current page:</span>{" "}
            <span>{data.currentPage ?? "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Completed:</span>{" "}
            <span>{data.completed ? "Yes" : "No"}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No progress yet.</p>
      )}
    </section>
  );
};

export default ProgressPanel;