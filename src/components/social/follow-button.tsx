"use client";

import { useState } from "react";

export function FollowButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFollow = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      setFollowing((f) => !f);
    } catch (e: any) {
      setError(e?.message || "Unable to update follow status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`${following ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:opacity-90"} rounded-md px-3 py-1.5 text-xs font-medium shadow transition`}
      >
        {loading ? (following ? "Unfollowing…" : "Following…") : following ? "Following" : "Follow"}
      </button>
      {error ? <span className="text-[11px] text-destructive">{error}</span> : null}
    </div>
  );
}

export default FollowButton;