"use client";

import React from "react";
import Link from "next/link";

type Bucket = { date: string; count: number };

type StatsPayload = {
  range: "weekly" | "monthly" | "all-time" | string;
  from: string;
  to: string;
  buckets: Bucket[];
  totalReads: number;
  genres: { name: string; count: number }[];
  topSeriesThisMonth: { id: number; slug: string; title: string; count: number }[];
  cached?: boolean;
};

export const StatsClient: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<StatsPayload | null>(null);

  const [range, setRange] = React.useState<"weekly" | "monthly" | "all-time">("weekly");
  const [genre, setGenre] = React.useState<string>("");

  const load = React.useCallback(async (opts?: { range?: string; genre?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const r = (opts?.range ?? range).toLowerCase();
      const g = (opts?.genre ?? genre).toLowerCase();
      const qs = new URLSearchParams();
      if (r) qs.set("range", r);
      if (g) qs.set("genre", g);
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch(`/api/stats?${qs.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Stats request failed (${res.status})`);
      }
      const json = (await res.json()) as StatsPayload;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [range, genre]);

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genres = data?.genres ?? [];
  const buckets = data?.buckets ?? [];

  // Compute max for bar heights
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reading Stats</h1>
          <p className="text-sm text-muted-foreground">Aggregated from your reading history</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={range}
            onChange={(e) => {
              const v = e.target.value as "weekly" | "monthly" | "all-time";
              setRange(v);
              load({ range: v, genre });
            }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all-time">All-time</option>
          </select>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm min-w-40"
            value={genre}
            onChange={(e) => {
              const v = e.target.value;
              setGenre(v);
              load({ genre: v, range });
            }}
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} ({g.count})
              </option>
            ))}
          </select>
          <button
            className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
            onClick={() => load()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Range</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "…" : (data?.range || range)}</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Reads</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "…" : (data?.totalReads ?? 0)}</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Genres</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "…" : genres.length}</div>
        </div>
      </div>

      {/* Weekly/Monthly graph (real buckets) */}
      <section className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Reading Over Time</h2>
            <p className="text-sm text-muted-foreground">
              {data ? new Date(data.from).toLocaleDateString() : ""} – {data ? new Date(data.to).toLocaleDateString() : ""}
            </p>
          </div>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Unable to load</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          ) : buckets.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reading activity in this range.</div>
          ) : (
            <div className="flex items-end gap-2 h-40 overflow-x-auto">
              {buckets.map((b) => {
                const height = Math.max(4, Math.round((b.count / maxBucket) * 140));
                return (
                  <div key={b.date} className="flex flex-col items-center justify-end">
                    <div className="w-8 rounded-t-md bg-primary/80" style={{ height }} title={`${b.date}: ${b.count}`} />
                    <div className="mt-2 text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(b.date).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Genre breakdown */}
      <section className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Genre Breakdown</h2>
            <p className="text-sm text-muted-foreground">Top tags across your library</p>
          </div>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Unable to load</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          ) : genres.length === 0 ? (
            <div className="text-sm text-muted-foreground">No genres detected yet.</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {genres.map((g) => (
                <li key={g.name} className="flex items-center justify-between rounded-md border bg-background p-3">
                  <span className="text-sm font-medium capitalize">{g.name}</span>
                  <span className="text-xs text-muted-foreground">{g.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Top series this month */}
      <section className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Top series this month</h2>
            <p className="text-sm text-muted-foreground">Most read in the current calendar month</p>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Unable to load</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          ) : (data?.topSeriesThisMonth?.length ?? 0) === 0 ? (
            <div className="text-sm text-muted-foreground">No reading activity yet this month.</div>
          ) : (
            <ul className="divide-y rounded-md border">
              {data!.topSeriesThisMonth.map((s) => (
                <li key={s.id} className="flex items-center justify-between p-3 hover:bg-accent">
                  <div className="min-w-0">
                    <Link href={`/series/${s.slug}`} className="truncate font-medium hover:underline">
                      {s.title || s.slug}
                    </Link>
                    <div className="text-xs text-muted-foreground">{s.slug}</div>
                  </div>
                  <div className="ml-4 shrink-0 rounded-full border px-2 py-0.5 text-xs">{s.count}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};