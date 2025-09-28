"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LibraryClient } from "@/components/library/library-client";
import { GateButton } from "@/components/autumn/feature-gate";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";

// Phase-1: disable mock fallback
const PHASE1_MOCK = false;

export default function DashboardPage() {
  const { data: session, isPending, refetch } = useSession();
  const [fallbackUser, setFallbackUser] = useState<any>(null);
  const [debug, setDebug] = useState<{ tokenPresent: boolean; cookie: string; serverRaw?: any } | null>(null);
  const router = useRouter();

  // Live stats
  const [statsLoading, setStatsLoading] = useState(false);
  const [libraryCount, setLibraryCount] = useState<number>(0);
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  
  // Discover preview state
  const [discoverLoading, setDiscoverLoading] = useState<boolean>(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discoverItems, setDiscoverItems] = useState<Array<{ id: string | number; title?: string; name?: string; image?: string | null; coverUrl?: string | null }>>([]);

  // Premium gating helpers (mirror feature-gate logic)
  const { customer, isLoading: customerLoading } = useCustomer();
  const premiumAllowed = (() => {
    const products: any[] = customer?.products ?? [];
    if (!products.length) return false;
    const name = products[0]?.name?.toLowerCase?.() || "";
    return name && !name.includes("free");
  })();

  // Admin controls visibility
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const check = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch("/api/admin", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    };
    check();
  }, []);

  // After a fresh login, cookies/tokens may settle microseconds later.
  // If we have a bearer token but no session yet, trigger one immediate refetch.
  useEffect(() => {
    if (!isPending && !session?.user) {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      if (token) refetch();
    }
  }, [isPending, session?.user, refetch]);

  // Fallback: verify on the server via our API if hook still shows no session
  useEffect(() => {
    if (PHASE1_MOCK && !session?.user && !fallbackUser) return; // skip network only when unauthenticated
    const run = async () => {
      if (!isPending && !session?.user) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
          const res = await fetch("/api/auth/session", {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) setFallbackUser(data.user);
            setDebug((prev) => ({
              tokenPresent: typeof window !== "undefined" ? !!localStorage.getItem("bearer_token") : false,
              cookie: typeof document !== "undefined" ? document.cookie : "",
              serverRaw: data,
            }));
          }
        } catch (_) {
          // ignore
        }
      }
    };
    run();
  }, [isPending, session?.user]);

  // Initialize debug snapshot on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDebug({
        tokenPresent: !!localStorage.getItem("bearer_token"),
        cookie: typeof document !== "undefined" ? document.cookie : "",
      });
    }
  }, []);

  // If still unauthenticated after checks, auto-redirect to login preserving return path (disabled in PHASE1_MOCK when logged out)
  useEffect(() => {
    if (PHASE1_MOCK && !session?.user && !fallbackUser) return; // do not redirect during Phase-1 mock for logged-out users
    if (!isPending && !session?.user && !fallbackUser) {
      const redirect = encodeURIComponent("/dashboard");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isPending, session?.user, fallbackUser, router]);

  // Fetch dashboard stats from library
  useEffect(() => {
    if (PHASE1_MOCK && !session?.user && !fallbackUser) return; // skip network only when unauthenticated
    const user = session?.user || fallbackUser;
    if (!user) return;
    const controller = new AbortController();
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    const load = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch("/api/library", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : data?.items ?? [];
        setLibraryCount(list.length);
        const unread = list.reduce((sum, it) => sum + (typeof it.unreadCount === "number" ? it.unreadCount : 0), 0);
        setUnreadTotal(unread);
      } catch (_) {
        // best-effort; leave defaults
      } finally {
        setStatsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [session?.user, fallbackUser]);

  // Fetch discover preview items
  useEffect(() => {
    if (PHASE1_MOCK && !session?.user && !fallbackUser) return; // skip network only when unauthenticated
    const user = session?.user || fallbackUser;
    if (!user) return;
    // Skip fetching recommendations when not premium (show upgrade prompt instead)
    if (!customerLoading && !premiumAllowed) return;
    const controller = new AbortController();
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    const loadDiscover = async () => {
      try {
        setDiscoverLoading(true);
        setDiscoverError(null);
        const res = await fetch("/api/discovery", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Discovery failed with ${res.status}`);
        }
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : data?.items ?? [];
        setDiscoverItems(list.slice(0, 6));
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setDiscoverError(e?.message || "Failed to load discovery");
      } finally {
        setDiscoverLoading(false);
      }
    };

    loadDiscover();
    return () => controller.abort();
  }, [session?.user, fallbackUser, customerLoading, premiumAllowed]);

  if (isPending) return <div className="p-8">Loading...</div>;

  const user = session?.user || fallbackUser;

  // Show a clear unauthenticated state instead of rendering nothing
  if (!user)
    return (
      <div className="p-8 space-y-3">
        <p className="text-muted-foreground">You need to be logged in to view the dashboard.</p>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-primary underline">Go to login</Link>
          <button
            className="px-3 py-1 rounded-md border text-sm"
            onClick={() => {
              // Force a refetch attempt
              refetch();
              // Also ping server session for visibility (pass Authorization if we have it)
              const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
              fetch("/api/auth/session", {
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              })
                .then((r) => r.json())
                .then((d) => setDebug((prev) => ({
                  tokenPresent: typeof window !== "undefined" ? !!localStorage.getItem("bearer_token") : false,
                  cookie: typeof document !== "undefined" ? document.cookie : "",
                  serverRaw: d,
                })))
                .catch(() => {});
            }}
          >Retry session</button>
        </div>

        {debug && (
          <div className="mt-4 rounded-md border bg-card p-4 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground">Debug (local)</div>
            <div>bearer_token present: {String(debug.tokenPresent)}</div>
            <div className="break-all">document.cookie: {debug.cookie || "(empty)"}</div>
            <div className="font-semibold text-foreground">/api/auth/session</div>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(debug.serverRaw ?? null, null, 2)}</pre>
          </div>
        )}
      </div>
    );

  // Authenticated UI — styled closer to Kenmei's dashboard with empty states
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.name || user.email}</h1>
          <p className="text-sm md:text-base text-muted-foreground">Your dashboard is ready. Start tracking your series.</p>
          {/* Plan badge */}
          <div className="mt-2 text-xs text-muted-foreground">
            Current plan: <span className="font-medium text-foreground">{customer?.products?.[0]?.name || "Free Plan"}</span>
            <Link href="/pricing" className="ml-2 underline">Upgrade</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <GateButton
            featureId="advanced_filters"
            href="/discovery"
            blockedMessage="Discovery recommendations are a premium feature. Upgrade to unlock personalized picks."
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90"
          >
            Discover
          </GateButton>
          <Link href="/library" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Go to Library</Link>
        </div>
      </div>

      {/* Admin quick actions */}
      {isAdmin && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            onClick={async () => {
              const token = localStorage.getItem("bearer_token");
              toast.info("Triggering source sync…");
              const res = await fetch("/api/admin/sync", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  "x-user-email": session?.user?.email || "",
                },
                body: JSON.stringify({ full: false }),
              });
              const data = await res.json().catch(() => ({}));
              if (res.ok) toast.success("Sync triggered"); else toast.error(data?.error || "Sync failed");
            }}
          >Sync Sources</button>
          <button
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            onClick={async () => {
              toast.info("Reindexing search…");
              const res = await fetch("/api/search/reindex", { method: "POST" });
              const data = await res.json().catch(() => ({}));
              if (res.ok) toast.success(`Reindexed ${data?.indexed ?? 0} documents`); else toast.error(data?.error || "Reindex failed");
            }}
          >Reindex Search</button>
          <button
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            onClick={async () => {
              toast.info("Running background worker…");
              const res = await fetch("/api/worker/sync", { method: "POST", headers: { "x-cron-secret": process.env.NEXT_PUBLIC_CRON_SECRET || "" } as any });
              const ok = res.ok;
              if (ok) toast.success("Worker sync executed"); else toast.error("Worker sync failed");
            }}
          >Run Worker</button>
          <button
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            onClick={async () => {
              toast.info("Verifying billing…");
              const res = await fetch("/api/subscriptions", { method: "GET", cache: "no-store" });
              const data = await res.json().catch(() => ({}));
              if (res.ok) {
                toast.success(`Plan: ${data?.products?.[0]?.name || data?.plan || "Unknown"}`);
              } else {
                toast.error(data?.error || "Unable to verify");
              }
            }}
          >Verify Billing</button>
        </div>
      )}

      {/* Quick cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Series Tracked</div>
          <div className="mt-2 text-3xl font-semibold">{statsLoading ? "…" : libraryCount}</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Chapters Read (30d)</div>
          <div className="mt-2 text-3xl font-semibold">0</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">New Updates</div>
          <div className="mt-2 text-3xl font-semibold">{statsLoading ? "…" : unreadTotal}</div>
        </div>
      </div>

      {/* Library */}
      <section className="mt-8 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Your Library</h2>
            <p className="text-sm text-muted-foreground">It looks empty for now. Start by adding a series you read.</p>
          </div>
          <GateButton
            featureId="advanced_filters"
            href="/discovery"
            blockedMessage="Discovery recommendations are a premium feature. Upgrade to unlock personalized picks."
            className="hidden md:inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90"
          >
            Start discovering
          </GateButton>
        </div>
        <div className="mt-6">
          <LibraryClient />
        </div>
        <div className="mt-6 md:hidden">
          <GateButton
            featureId="advanced_filters"
            href="/discovery"
            blockedMessage="Discovery recommendations are a premium feature. Upgrade to unlock personalized picks."
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90 w-full justify-center"
          >
            Start discovering
          </GateButton>
        </div>
      </section>

      {/* Premium tools section (gated) */}
      <section className="mt-8 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Premium tools</h2>
            <p className="text-sm text-muted-foreground">Unlock advanced filters, notifications, cross‑device sync, and premium themes.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GateButton featureId="advanced_filters" href="/search" blockedMessage="Upgrade to use advanced filters" className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Advanced Filters</GateButton>
          <GateButton featureId="notifications" href="/account" blockedMessage="Upgrade to enable notifications" className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Notifications</GateButton>
          <GateButton featureId="cross_device_sync" href="/account" blockedMessage="Upgrade to enable cross-device sync" className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Cross‑device Sync</GateButton>
          <GateButton featureId="premium_themes" href="/account" blockedMessage="Upgrade to unlock premium themes" className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Premium Themes</GateButton>
        </div>
      </section>

      {/* Discover preview (empty) */}
      <section className="mt-8 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Discover</h2>
            <p className="text-sm text-muted-foreground">Personalized picks will appear here once you start tracking.</p>
          </div>
          <GateButton
            featureId="advanced_filters"
            href="/search?sort=newest+desc"
            blockedMessage="Advanced browsing is a premium feature. Upgrade to unlock enhanced filters."
            className="hidden md:inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Browse all
          </GateButton>
        </div>
        <div className="mt-6">
          {discoverLoading ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
              Loading picks...
            </div>
          ) : !customerLoading && !premiumAllowed ? (
            <div className="rounded-md border bg-card p-4 text-sm">
              <p className="font-medium">Unlock personalized discovery</p>
              <p className="mt-1 text-muted-foreground">Recommendations are a premium feature. Upgrade to see picks tailored to you.</p>
              <div className="mt-3">
                <GateButton
                  featureId="advanced_filters"
                  href="/pricing"
                  blockedMessage="Upgrade to unlock discovery recommendations."
                  className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium shadow hover:opacity-90"
                >
                  Upgrade plan
                </GateButton>
              </div>
            </div>
          ) : discoverError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Unable to load discovery</p>
              <p className="mt-1 text-muted-foreground">{discoverError}</p>
            </div>
          ) : discoverItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">No suggestions yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {discoverItems.map((it, i) => {
                const title = it.title || it.name || "Untitled";
                const img = (it.coverUrl || it.image) ?? null;
                return (
                  <Link href={`/series/${encodeURIComponent(String(((it as any).slug ?? (it as any).id ?? i)))}`} key={String((it as any).id ?? i)} className="group">
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-md border bg-muted">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={title} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No cover</div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/90">{title}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-6 md:hidden">
          <GateButton
            featureId="advanced_filters"
            href="/search?sort=newest+desc"
            blockedMessage="Advanced browsing is a premium feature. Upgrade to unlock enhanced filters."
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent w-full justify-center"
          >
            Browse all
          </GateButton>
        </div>
      </section>
    </div>
  );
}