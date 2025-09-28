"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  slug: string;
}

export const AddToLibrary = ({ slug }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch(`/api/series/${encodeURIComponent(slug)}/library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "reading" }),
      });

      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Failed to add to library");
        return;
      }

      setSaved(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading || saved}
          className="inline-flex items-center px-4 py-2 rounded-md border bg-secondary hover:bg-accent disabled:opacity-60"
        >
          {saved ? "In Library" : loading ? "Adding..." : "Add to Library"}
        </button>
        {error ? <span className="text-sm text-destructive">{error}</span> : null}
      </div>

      {unauthorized ? (
        <div className="text-sm text-muted-foreground">
          Please log in to add this series to your library. {" "}
          <Link href="/login" className="underline hover:text-foreground">Log in</Link> {" "}
          or {" "}
          <Link href="/register" className="underline hover:text-foreground">Create an account</Link>.
        </div>
      ) : null}
    </div>
  );
};