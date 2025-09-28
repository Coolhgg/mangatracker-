"use client";

import { useMemo, useState } from "react";
import { GateButton } from "@/components/autumn/feature-gate";
import { DiscoveryGrid, type DiscoveryItem } from "./discovery-grid";

interface Props {
  initialItems: DiscoveryItem[];
  initialPage: number;
  pageSize: number;
  initialHasMore: boolean;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "updated", label: "Recently Updated" },
  { value: "latest_chapter", label: "Latest Chapter" },
  { value: "most_followed", label: "Most Followed" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "oldest", label: "Oldest" },
] as const;

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const CONTENT_RATING_OPTIONS = [
  { value: "safe", label: "Safe" },
  { value: "suggestive", label: "Suggestive" },
  { value: "erotica", label: "Erotica" },
  { value: "pornographic", label: "Pornographic" },
] as const;

// New: Type, Languages, Period presets
const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "manga", label: "Manga (JP)" },
  { value: "manhwa", label: "Manhwa (KR)" },
  { value: "manhua", label: "Manhua (CN)" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "pt-br", label: "Portuguese (BR)" },
  { value: "ru", label: "Russian" },
  { value: "vi", label: "Vietnamese" },
  { value: "id", label: "Indonesian" },
  { value: "tr", label: "Turkish" },
] as const;

const PERIOD_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "365d", label: "Last year" },
] as const;

export const DiscoverySection = ({ initialItems, initialPage, pageSize, initialHasMore }: Props) => {
  const [sort, setSort] = useState<string>("newest");
  const [openFilters, setOpenFilters] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, boolean>>({});
  const [perPage, setPerPage] = useState<number>(pageSize);
  // New filters state
  const [type, setType] = useState<string>("");
  const [languages, setLanguages] = useState<Record<string, boolean>>({});
  const [period, setPeriod] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [tagIds, setTagIds] = useState<string>(""); // Comma-separated MangaDex tag IDs

  const isDefaultQuery = useMemo(() => {
    const anyStatus = Object.values(statuses).some(Boolean);
    const anyRating = Object.values(ratings).some(Boolean);
    const anyLang = Object.values(languages).some(Boolean);
    const anyTags = tagIds.trim().length > 0;
    const anyType = !!type;
    const anyPeriod = !!period;
    const anyYear = !!year;
    return (
      sort === "newest" &&
      !anyStatus &&
      !anyRating &&
      !anyLang &&
      !anyTags &&
      !anyType &&
      !anyPeriod &&
      !anyYear &&
      perPage === pageSize
    );
  }, [sort, statuses, ratings, languages, tagIds, type, period, year, perPage, pageSize]);

  const extraQuery = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("sort", sort);
    if (type) sp.set("type", type);
    Object.entries(statuses).forEach(([k, v]) => v && sp.append("status", k));
    Object.entries(ratings).forEach(([k, v]) => v && sp.append("contentRating", k));
    Object.entries(languages).forEach(([k, v]) => v && sp.append("readableOn", k));
    if (period) sp.set("period", period);
    if (year) sp.set("year", year);
    // Tags: comma separated IDs -> tag=...
    if (tagIds.trim()) {
      tagIds
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => sp.append("tag", t));
    }
    return sp.toString();
  }, [sort, statuses, ratings, languages, period, year, tagIds]);

  const selectedCount = useMemo(() => {
    const s = Object.values(statuses).filter(Boolean).length;
    const r = Object.values(ratings).filter(Boolean).length;
    const l = Object.values(languages).filter(Boolean).length;
    const t = tagIds.split(",").map((t) => t.trim()).filter(Boolean).length;
    const extras = (type ? 1 : 0) + (period ? 1 : 0) + (year ? 1 : 0);
    return s + r + l + t + extras;
  }, [statuses, ratings, languages, tagIds, type, period, year]);

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Discovery</h1>
          <p className="text-sm md:text-base text-muted-foreground">Find new series based on your taste.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpenFilters((v) => !v)}
              aria-expanded={openFilters}
            >
              Filters{selectedCount ? ` (${selectedCount})` : ""}
            </button>
            {openFilters && (
              <div className="absolute right-0 z-20 mt-2 w-[22rem] rounded-md border bg-popover p-4 shadow">
                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">Type</div>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags (IDs) */}
                  <div>
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">Tags</div>
                    <input
                      type="text"
                      placeholder="Comma-separated MangaDex tag IDs"
                      value={tagIds}
                      onChange={(e) => setTagIds(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Example: 391b0423-d847-456f-aff0-8b0cfc03066b</p>
                  </div>

                  {/* Publication Status */}
                  <div>
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">Publication Status</div>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={Boolean(statuses[opt.value])}
                            onChange={(e) => setStatuses((prev) => ({ ...prev, [opt.value]: e.target.checked }))}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Readable On (Languages) */}
                  <div>
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">Readable On</div>
                    <div className="grid grid-cols-2 gap-2">
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={Boolean(languages[opt.value])}
                            onChange={(e) => setLanguages((prev) => ({ ...prev, [opt.value]: e.target.checked }))}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Release period + year */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-2 text-xs font-semibold text-muted-foreground">Release period</div>
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        {PERIOD_OPTIONS.map((opt) => (
                          <option key={opt.value || "any"} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-semibold text-muted-foreground">Year</div>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 2021"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                      onClick={() => {
                        setStatuses({});
                        setRatings({});
                        setLanguages({});
                        setType("");
                        setPeriod("");
                        setYear("");
                        setTagIds("");
                      }}
                    >
                      Clear
                    </button>
                    <button
                      className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                      onClick={() => setOpenFilters(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <GateButton
            featureId="advanced_filters"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
            blockedMessage="Advanced filters are a premium feature. Upgrade to unlock."
          >
            Advanced
          </GateButton>
        </div>
      </header>

      {/* Results grid */}
      <DiscoveryGrid
        key={`${extraQuery || "default"}|pp=${perPage}`}
        initialItems={isDefaultQuery ? initialItems : []}
        initialPage={isDefaultQuery ? initialPage : 0}
        pageSize={perPage}
        initialHasMore={isDefaultQuery ? initialHasMore : true}
        extraQuery={extraQuery}
      />
    </div>
  );
};

export default DiscoverySection;