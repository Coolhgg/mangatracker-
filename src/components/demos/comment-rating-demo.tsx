"use client";

import { useState } from "react";
import CommentForm from "@/components/series/comment-form";
import RatingWidget from "@/components/series/rating-widget";

export const CommentRatingDemo = () => {
  const [slug, setSlug] = useState("");

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Comment & Rating Demo</h2>
            <p className="text-sm text-muted-foreground">
              Enter a series slug and try posting a comment or rating. Requests will use your bearer token if available.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium">Series slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. one-piece"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Server APIs used: POST /api/series/[slug]/comments and POST /api/series/[slug]/rating
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm font-medium">How auth is handled</div>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>If no token in localStorage.getItem("bearer_token"), you will be redirected to /login with redirect back to the current page.</li>
              <li>Requests include Authorization: Bearer &lt;token&gt; on POST.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Try a rating</h3>
            {slug ? (
              <RatingWidget slug={slug} />
            ) : (
              <div className="rounded-md border p-3 text-sm text-muted-foreground">Enter a slug to enable rating.</div>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Post a comment</h3>
            {slug ? (
              <CommentForm slug={slug} />
            ) : (
              <div className="rounded-md border p-3 text-sm text-muted-foreground">Enter a slug to enable comments.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommentRatingDemo;