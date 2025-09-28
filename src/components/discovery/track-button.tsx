"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TrackButtonProps {
  source: string; // e.g., "mangadx"
  sourceSeriesId: string;
  className?: string;
}

export const TrackButton: React.FC<TrackButtonProps> = ({ source, sourceSeriesId, className }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTrack = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    if (!token) {
      toast.error("Please log in first to track series");
      // Redirect to login with return path
      const redirect = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ source, sourceSeriesId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to track series");
        return;
      }
      toast.success("Added to your library");
      router.push("/library");
    } catch (e: any) {
      toast.error(e?.message || "Failed to track series");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTrack}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs px-2.5 py-1.5 shadow hover:opacity-90 disabled:opacity-60"
      }
      aria-label="Track series"
    >
      {loading ? "Adding…" : "Track"}
    </button>
  );
};