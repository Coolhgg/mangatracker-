"use client";

import { useSession } from "@/lib/auth-client";
import { useCustomer } from "autumn-js/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { data: session, isPending, refetch } = useSession();
  const { customer, isLoading: customerLoading, refetch: refetchCustomer } = useCustomer();
  const router = useRouter();
  const [billingLoading, setBillingLoading] = useState(false);
  const [stats, setStats] = useState<{ libraryCount: number; chaptersRead: number } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/login?redirect=${encodeURIComponent("/account")}`);
    }
  }, [isPending, session, router]);

  // Fetch user stats
  useEffect(() => {
    if (!session?.user) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    
    Promise.all([
      fetch("/api/library", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then(r => r.json()),
      fetch("/api/stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then(r => r.json()).catch(() => ({ chaptersRead: 0 }))
    ]).then(([library, statsData]) => {
      const list = Array.isArray(library) ? library : library?.items ?? [];
      setStats({
        libraryCount: list.length,
        chaptersRead: statsData?.chaptersRead ?? 0
      });
    }).catch(() => {});
  }, [session?.user]);

  const handleBillingPortal = async () => {
    if (!session?.user) return;
    setBillingLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          returnUrl: (() => {
            if (typeof window === "undefined") return undefined;
            const t = localStorage.getItem("bearer_token");
            const u = new URL(window.location.href);
            if (t) u.searchParams.set("token", t);
            return u.toString();
          })(),
        }),
      });
      const data = await res.json();
      if (data?.url) {
        const isInIframe = typeof window !== "undefined" && window.self !== window.top;
        if (isInIframe) {
          window.parent?.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: data.url } }, "*");
        } else {
          window.open(data.url, "_blank", "noopener,noreferrer");
        }
      } else {
        toast.error("Unable to open billing portal");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to open billing portal");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const user = session.user;
  const currentPlan = customer?.products?.[0];
  const planName = currentPlan?.name || "Free Plan";
  const planStatus = currentPlan?.status;
  const isPremium = currentPlan && !planName.toLowerCase().includes("free");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your profile, subscription, and preferences.
          </p>
        </div>

        {/* Profile Section */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <div className="mt-1 text-base font-medium">{user.name || "Not set"}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="mt-1 text-base font-medium">{user.email}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Member since</label>
              <div className="mt-1 text-base font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          {customerLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscription...
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Current Plan</label>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-lg font-semibold">{planName}</span>
                  {planStatus === "past_due" && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Payment Failed
                    </span>
                  )}
                  {planStatus === "trialing" && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                      Trial
                    </span>
                  )}
                  {planStatus === "active" && isPremium && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {currentPlan && (
                <>
                  <div>
                    <label className="text-sm text-muted-foreground">Started</label>
                    <div className="mt-1 text-base">
                      {new Date(currentPlan.started_at).toLocaleDateString()}
                    </div>
                  </div>
                  {currentPlan.current_period_end && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        {currentPlan.status === "canceled" ? "Ends" : "Renews"}
                      </label>
                      <div className="mt-1 text-base">
                        {new Date(currentPlan.current_period_end).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {!isPremium ? (
                  <a
                    href="/pricing"
                    className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90"
                  >
                    Upgrade Plan
                  </a>
                ) : (
                  <button
                    onClick={handleBillingPortal}
                    disabled={billingLoading}
                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
                  >
                    {billingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      "Manage Billing"
                    )}
                  </button>
                )}
                <a
                  href="/pricing"
                  className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  View All Plans
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Usage Stats */}
        {customer?.features && Object.keys(customer.features).length > 0 && (
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Usage</h2>
            <div className="space-y-4">
              {Object.entries(customer.features).map(([featureId, feature]) => {
                const { unlimited, usage, included_usage, balance, next_reset_at } = feature as any;
                const percentage = unlimited ? 100 : (usage / included_usage) * 100;
                
                return (
                  <div key={featureId}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium capitalize">
                        {featureId.replace(/_/g, " ")}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {unlimited ? "Unlimited" : `${usage} / ${included_usage}`}
                      </span>
                    </div>
                    {!unlimited && (
                      <>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        {next_reset_at && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Resets {new Date(next_reset_at).toLocaleDateString()}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Activity Stats */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Series Tracked</div>
              <div className="mt-1 text-2xl font-semibold">{stats?.libraryCount ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Chapters Read</div>
              <div className="mt-1 text-2xl font-semibold">{stats?.chaptersRead ?? "—"}</div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you sign out, you'll need to log in again to access your account.
          </p>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center rounded-md border border-destructive bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}