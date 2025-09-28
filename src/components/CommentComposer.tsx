"use client";
import { useState } from "react";

export const CommentComposer = ({ onSubmit }: { onSubmit?: (content: string) => void }) => {
  const [value, setValue] = useState("");
  return (
    <div className="rounded-lg border p-3">
      <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Write a comment..." className="min-h-24 w-full resize-y rounded-md border bg-background p-2 text-sm" />
      <div className="mt-2 flex justify-end">
        <button onClick={() => { onSubmit?.(value); setValue(""); }} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Post</button>
      </div>
    </div>
  );
};