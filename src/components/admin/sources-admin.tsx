"use client";

import { useEffect, useMemo, useState } from "react";

type Source = {
  id: number;
  name: string;
  domain: string;
  verified: boolean;
  enabled: boolean;
  trustScore: number;
  legalRisk?: string;
  robotsAllowed?: boolean;
  updatedAt?: string;
};

export const SourcesAdmin = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [syncing, setSyncing] = useState<Record<number, boolean>>({});
  const [dirty, setDirty] = useState<Record<number, number>>({}); // id -> edited trust

  const token = useMemo(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    } catch {
      return null;
    }
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sources?includeUnverified=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load sources (${res.status})`);
      const data: Source[] = await res.json();
      setSources(data);
      setDirty({});
    } catch (e: any) {
      setError(e?.message || "Failed to load sources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTrust = async (id: number, nextTrust: number) => {
    // Optimistic update
    setSaving((s) => ({ ...s, [id]: true }));
    const prev = sources.map((it) => ({ ...it }));
    setSources((list) => list.map((s) => (s.id === id ? { ...s, trustScore: nextTrust } : s)));

    try {
      const res = await fetch(`/api/sources/${id}/trust`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ trustScore: nextTrust }),
      });
      if (!res.ok) throw new Error(`Failed to update trust (${res.status})`);
      // Optional: sync server response into state (in case backend adjusts value)
      const payload = await res.json();
      if (payload?.source?.trustScore != null) {
        setSources((list) => list.map((s) => (s.id === id ? { ...s, trustScore: payload.source.trustScore } : s)));
      }
      // Clear dirty entry if saved successfully
      setDirty((d) => {
        const copy = { ...d };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      // Revert
      setSources(prev);
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  const triggerSync = async (id: number, full = false) => {
    setSyncing((m) => ({ ...m, [id]: true }));
    try {
      const res = await fetch(`/api/sources/${id}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ full }),
      });
      if (!res.ok) throw new Error(`Failed to queue sync (${res.status})`);
      // No state change needed here beyond activity indicator
    } catch (e) {
      // Could set an error indicator per row in future
    } finally {
      setSyncing((m) => ({ ...m, [id]: false }));
    }
  };

  const saveAll = async () => {
    const entries = Object.entries(dirty);
    if (!entries.length) return;
    // Sequential save to keep UI simple and deterministic
    for (const [idStr, trust] of entries) {
      const id = Number(idStr);
      // eslint-disable-next-line no-await-in-loop
      await updateTrust(id, trust);
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading sources…</div>;
  if (error)
    return (
      <div className="space-y-3">
        <div className="text-sm text-destructive">{error}</div>
        <button
          onClick={fetchSources}
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );

  const hasDirty = Object.keys(dirty).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{sources.length} source(s)</div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSources}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Refresh
          </button>
          <button
            onClick={saveAll}
            disabled={!hasDirty}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            Save all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Domain</th>
              <th className="px-3 py-2 font-medium">Verified</th>
              <th className="px-3 py-2 font-medium">Trust</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{s.domain}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs " +
                      (s.verified
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300")
                    }
                  >
                    {s.verified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.trustScore}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const num = Number(raw);
                        const clamped = Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : s.trustScore;
                        setSources((list) => list.map((it) => (it.id === s.id ? { ...it, trustScore: clamped } : it)));
                        setDirty((d) => ({ ...d, [s.id]: clamped }));
                      }}
                      className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => updateTrust(s.id, s.trustScore)}
                      disabled={!!saving[s.id]}
                      className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {saving[s.id] ? "Saving…" : "Save"}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerSync(s.id, false)}
                      disabled={!!syncing[s.id]}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                    >
                      {syncing[s.id] ? "Syncing…" : "Quick sync"}
                    </button>
                    <button
                      onClick={() => triggerSync(s.id, true)}
                      disabled={!!syncing[s.id]}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                    >
                      {syncing[s.id] ? "Syncing…" : "Full sync"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { SourcesAdmin as default };