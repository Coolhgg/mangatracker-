export interface CommentItem { id: string; author: string; content: string; createdAt?: string; threadId?: number | null; threadTitle?: string }

export const CommentList = ({ items = [], onReply }: { items?: CommentItem[]; onReply?: (commentId: string) => void }) => {
  if (!items.length) {
    return <div className="text-sm text-muted-foreground">No comments yet.</div>;
  }

  // Group by threadId (null bucket for unthreaded)
  const groups = items.reduce<Record<string, CommentItem[]>>((acc, item) => {
    const key = String(item.threadId ?? "none");
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([key, group]) => (
        <div key={key} className="space-y-3">
          {key !== "none" && (
            <div className="text-xs font-medium text-muted-foreground">Thread: {group[0]?.threadTitle || `#${group[0]?.threadId}`}</div>
          )}
          <ul className="space-y-4">
            {group.map((c) => (
              <li key={c.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{c.author}</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">{c.content}</div>
                    {c.createdAt && (
                      <div className="mt-1 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                    )}
                  </div>
                  {onReply && (
                    <button
                      type="button"
                      onClick={() => onReply(c.id)}
                      className="shrink-0 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};