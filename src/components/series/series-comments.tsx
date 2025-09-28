"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CommentForm } from "@/components/series/comment-form";
import { CommentList } from "@/components/CommentList";

export interface CommentItem {
  id: string;
  author: string;
  content: string;
  createdAt?: string;
  threadId?: number | null;
  threadTitle?: string;
}

interface SeriesCommentsProps {
  slug: string;
}

export const SeriesComments = ({ slug }: SeriesCommentsProps) => {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<number | null>(null);

  const formContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchComments = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await fetch(`/api/series/${encodeURIComponent(slug)}/comments`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load comments (${res.status})`);
      const data = await res.json();
      const list: any[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const mapped: CommentItem[] = list.map((c: any) => ({
        id: String(c.id),
        author: c.author?.name || c.author || "User",
        content: c.content,
        createdAt: c.createdAt || c.created_at,
        threadId: typeof c.threadId === "number" || c.threadId === null ? c.threadId : c.thread_id ?? null,
        threadTitle: c.thread?.title || c.threadTitle,
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || "Could not load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleReply = (commentId: string) => {
    const numeric = Number(commentId);
    setReplyToId(Number.isFinite(numeric) ? numeric : null);
    // Scroll to form container and let the form autofocus
    formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleOptimistic = (temp: { id: number; content: string; threadId?: number | null; createdAt: string }) => {
    setItems((prev) => [
      ...prev,
      {
        id: String(temp.id),
        author: "You",
        content: temp.content,
        createdAt: temp.createdAt,
        threadId: temp.threadId ?? null,
      },
    ]);
  };

  const handleCreated = (comment: { id: number; content: string; threadId?: number | null; createdAt: string }) => {
    setItems((prev) => [
      ...prev,
      {
        id: String(comment.id),
        author: "You",
        content: comment.content,
        createdAt: comment.createdAt,
        threadId: comment.threadId ?? null,
      },
    ]);
    setReplyToId(null);
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">Comments</h2>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading comments…</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <CommentList items={items} onReply={handleReply} />
      )}

      <div ref={formContainerRef} className="mt-6">
        <CommentForm
          slug={slug}
          onOptimistic={handleOptimistic}
          onCreated={handleCreated}
          replyToId={replyToId}
          onReplyChange={setReplyToId}
        />
      </div>
    </section>
  );
};

export default SeriesComments;