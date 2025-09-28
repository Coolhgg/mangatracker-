"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface RatingWidgetProps {
  slug: string;
  initial?: number | null;
}

export const RatingWidget = ({ slug, initial = null }: RatingWidgetProps) => {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(initial);
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onRate = async (value: number) => {
    setError(null);
    setSuccess(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/series/${encodeURIComponent(slug)}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: value }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed with ${res.status}`);
      }
      setRating(value);
      setSuccess("Rating saved");
    } catch (e: any) {
      setError(e?.message || "Failed to save rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Your rating</div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((v) => {
          const active = (hover ?? rating ?? 0) >= v;
          return (
            <button
              key={v}
              type="button"
              disabled={submitting}
              onMouseEnter={() => setHover(v)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onRate(v)}
              className={`h-8 w-8 rounded-md border flex items-center justify-center transition-colors ${
                active ? "bg-orange-500 text-white border-orange-500" : "bg-background text-foreground/80"
              } disabled:opacity-50`}
              aria-label={`Rate ${v} star${v > 1 ? "s" : ""}`}
            >
              {active ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      <div className="min-h-5 text-sm">
        {submitting && <span className="text-muted-foreground">Saving…</span>}
        {!submitting && success && <span className="text-green-600">{success}</span>}
        {!submitting && error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
};

export default RatingWidget;