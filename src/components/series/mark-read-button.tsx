"use client";

import { useState } from "react";

export const MarkReadButton = ({ chapterId }: { chapterId: string }) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleMarkRead = async () => {
    if (loading || done) return;
    setLoading(true);
    setErr(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch(`/api/chapters/${chapterId}/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || "Failed to mark as read");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleMarkRead}
        disabled={loading || done}
        className={`rounded-md px-3 py-1.5 text-xs font-medium shadow transition ${done ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}
      >
        {done ? "Read" : loading ? "Marking…" : "Mark read"}
      </button>
      {err ? <span className="text-[11px] text-destructive">{err}</span> : null}
    </div>
  );
};

export default MarkReadButton;