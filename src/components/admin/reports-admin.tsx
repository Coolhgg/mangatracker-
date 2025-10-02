"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ReportItem = {
  id: number;
  status: "open" | "reviewing" | "resolved" | "rejected";
  reason: string | null;
  userId: number;
  seriesId?: number | null;
  commentId?: number | null;
  threadId?: number | null;
  createdAt: string;
};

export const ReportsAdmin = () => {
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [seriesId, setSeriesId] = useState<string>("");
  const [commentId, setCommentId] = useState<string>("");
  const [threadId, setThreadId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReportItem[]>([]);

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (seriesId) params.set("seriesId", seriesId);
    if (commentId) params.set("commentId", commentId);
    if (threadId) params.set("threadId", threadId);
    return params.toString();
  }, [status, type, seriesId, commentId, threadId]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports${qs ? `?${qs}` : ""}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed: ${res.status}`);
      }
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const updateStatus = async (id: number, newStatus: ReportItem["status"]) => {
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed: ${res.status}`);
      }
      await fetchReports();
    } catch (e: any) {
      setError(e?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="series">Series</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="thread">Thread</SelectItem>
          </SelectContent>
        </Select>
        <Input value={seriesId} onChange={(e) => setSeriesId(e.target.value)} placeholder="Series ID" className="h-9" />
        <Input value={commentId} onChange={(e) => setCommentId(e.target.value)} placeholder="Comment ID" className="h-9" />
        <Input value={threadId} onChange={(e) => setThreadId(e.target.value)} placeholder="Thread ID" className="h-9" />
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Linked</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-3">{r.id}</td>
                  <td className="py-2 pr-3">
                    <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3 max-w-[24ch] truncate" title={r.reason || ""}>{r.reason}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {r.seriesId ? `Series:${r.seriesId} ` : ""}
                    {r.threadId ? `Thread:${r.threadId} ` : ""}
                    {r.commentId ? `Comment:${r.commentId}` : ""}
                  </td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      {r.status !== "resolved" && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(r.id, "resolved")}>
                          Resolve
                        </Button>
                      )}
                      {r.status !== "rejected" && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(r.id, "rejected")}>
                          Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="py-4 text-sm text-muted-foreground" colSpan={6}>No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export { ReportsAdmin as default };