"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { LibraryClient } from "@/components/library/library-client";

// Removed mock preview: always show login prompt when logged out
export const LibraryLoader = () => {
  const { data: session, isPending, refetch } = useSession();
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const user = session?.user;

  useEffect(() => {
    if (isPending || !user) return;

    const controller = new AbortController();
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

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
          const t = await res.text();
          throw new Error(t || `Failed with ${res.status}`);
        }
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : data?.items ?? [];
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
  }, [user, isPending]);

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Checking session…</div>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-card p-4 text-sm">
          <div className="font-medium">Sign in to view your library</div>
          <div className="mt-1 text-muted-foreground">Log in to load your tracked series and progress.</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a href="/login" className="text-primary underline">Go to login</a>
          <button
            className="px-3 py-1 rounded-md border"
            onClick={() => {
              refetch();
              const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
              fetch("/api/auth/session", {
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              }).catch(() => {});
            }}
          >Retry session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Loading library…
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <div className="font-medium text-destructive">Unable to load</div>
          <div className="mt-1 text-muted-foreground">{error}</div>
          <div className="mt-2">
            <button
              className="px-3 py-1.5 rounded-md border text-sm"
              onClick={() => {
                // optimistic retry
                setError(null);
                setLoading(true);
                const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
                fetch("/api/library", {
                  method: "GET",
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
                  .catch((e) => setError(e?.message || "Failed to load"))
                  .finally(() => setLoading(false));
              }}
            >Retry</button>
          </div>
        </div>
      )}

      <LibraryClient items={items ?? []} />
    </div>
  );
};