"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";

interface SearchControlsProps {
  initialQuery?: string;
  initialSort?: string;
}

export const SearchControls = ({ initialQuery = "", initialSort = "newest desc" }: SearchControlsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [status, setStatus] = useState<string>(searchParams.get("status") || "");
  const [rating, setRating] = useState<string>(searchParams.get("rating") || "");

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (status) params.set("status", status);
    if (rating) params.set("rating", rating);
    return params.toString();
  }, [q, sort, status, rating]);

  const onSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const qs = buildQuery();
      router.push(`/search${qs ? `?${qs}` : ""}`);
    },
    [buildQuery, router]
  );

  const activeFilters = useMemo(() => {
    const chips: string[] = [];
    if (status) chips.push(`Status: ${status}`);
    if (rating) chips.push(`Rating: ${rating}`);
    return chips;
  }, [status, rating]);

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <form onSubmit={onSubmit} className="md:col-span-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <input
            aria-label="Search"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70"
            placeholder="Search series..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            aria-label="Sort"
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest desc">Newest</option>
            <option value="rating desc">Top rated</option>
            <option value="title asc">Title A–Z</option>
          </select>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow">
            Search
          </button>
        </div>
        {activeFilters.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span key={f} className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        ) : null}
      </form>

      <div className="md:col-span-1">
        <FiltersPanel>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Any</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Rating</span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">Any</option>
                <option value="4">4★+</option>
                <option value="3">3★+</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus("");
                setRating("");
                onSubmit();
              }}
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Apply
            </button>
          </div>
        </FiltersPanel>
      </div>
    </div>
  );
};

export default SearchControls;