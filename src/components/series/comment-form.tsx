"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommentFormProps {
  slug: string;
  threadId?: number;
  onOptimistic?: (temp: { id: number; content: string; threadId?: number | null; createdAt: string }) => void;
  onCreated?: (comment: { id: number; content: string; threadId?: number | null; createdAt: string }) => void;
  // New controlled reply props
  replyToId?: number | null;
  onReplyChange?: (id: number | null) => void;
}

export const CommentForm = ({ slug, threadId, onOptimistic, onCreated, replyToId, onReplyChange }: CommentFormProps) => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Internal reply state (controlled when prop provided)
  const [internalReplyToId, setInternalReplyToId] = useState<number | null>(null);
  const effectiveReplyToId = useMemo(() => (typeof replyToId === "number" || replyToId === null ? replyToId : internalReplyToId), [replyToId, internalReplyToId]);
  const setReply = (id: number | null) => {
    if (typeof replyToId === "number" || replyToId === null) {
      onReplyChange?.(id);
    } else {
      setInternalReplyToId(id);
    }
  };
  // Thread picking state
  const [threads, setThreads] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | undefined>(threadId);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (effectiveReplyToId != null) {
      // Autofocus textarea when a reply target is set
      textareaRef.current?.focus();
    }
  }, [effectiveReplyToId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/threads?slug=${encodeURIComponent(slug)}&pageSize=50`);
        if (!res.ok) return;
        const data = await res.json();
        const list: Array<{ id: number; title: string }> = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (cancelled) return;
        setThreads(list);
        // Initialize selection: prefer prop threadId, else first thread when multiple
        if (typeof selectedThreadId === "undefined") {
          setSelectedThreadId(threadId ?? list[0]?.id);
        }
      } catch {
        // ignore thread load errors; control is optional
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setSubmitting(true);

      const effectiveThreadId = selectedThreadId ?? threadId ?? null;

      // Optimistic insert (optional)
      const optimisticItem = {
        id: -Date.now(),
        content: content.trim(),
        threadId: effectiveThreadId ?? null,
        createdAt: new Date().toISOString(),
      };
      if (onOptimistic) onOptimistic(optimisticItem);

      const res = await fetch(`/api/series/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, threadId: effectiveThreadId ?? undefined, parentId: effectiveReplyToId ?? undefined }),
      });
      if (!res.ok) {
        const txt = await res.text();
        if (res.status === 429) throw new Error("You are posting too fast. Please wait a moment and try again.");
        throw new Error(txt || `Failed with ${res.status}`);
      }
      const created = await res.json();
      setContent("");
      setReply(null);
      setSuccess("Comment posted");
      if (onCreated) onCreated(created);
    } catch (err: any) {
      setError(err?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const textareaId = `comment-${slug || "demo"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor={textareaId} className="block text-sm font-medium">Add a comment</label>
      {/* Thread picker (only when multiple threads exist) */}
      {threads.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Thread</span>
          <Select
            value={(selectedThreadId ?? "").toString()}
            onValueChange={(v) => setSelectedThreadId(Number(v))}
          >
            <SelectTrigger size="sm" className="h-8">
              <SelectValue placeholder="Select thread" />
            </SelectTrigger>
            <SelectContent>
              {threads.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {/* Reply context */}
      {effectiveReplyToId != null && (
        <div className="flex items-center justify-between rounded-md border px-2 py-1 text-xs">
          <span>Replying to comment #{effectiveReplyToId}</span>
          <button type="button" onClick={() => setReply(null)} className="underline">Cancel</button>
        </div>
      )}
      <textarea
        id={textareaId}
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts…"
        className="w-full min-h-24 rounded-md border bg-background p-3 text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post comment"}
        </button>
        {error && <span className="text-sm text-destructive">{error}</span>}
        {success && <span className="text-sm text-green-600">{success}</span>}
      </div>
    </form>
  );
};

export default CommentForm;