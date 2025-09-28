"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground break-words text-sm">
          {process.env.NODE_ENV === "development" ? error?.message : "An unexpected error occurred. Please try again."}
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>Go home</Button>
        </div>
      </div>
    </div>
  );
}