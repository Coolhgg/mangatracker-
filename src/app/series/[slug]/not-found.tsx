import Link from "next/link";
import { Search, Library, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg border bg-card">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Series not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn’t find that series. It may have been removed or the link is incorrect.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/discovery"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition"
          >
            <Search className="h-4 w-4" />
            Explore discovery
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 hover:bg-accent transition"
          >
            <Library className="h-4 w-4" />
            Go to your library
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 hover:bg-accent transition"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}