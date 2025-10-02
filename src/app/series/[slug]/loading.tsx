export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Series header skeleton */}
        <div className="flex gap-6">
          <div className="aspect-[2/3] w-48 rounded-lg bg-muted" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-20 w-full rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-10 w-24 rounded bg-muted" />
              <div className="h-10 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-4 border-b">
          <div className="h-10 w-24 rounded-t bg-muted" />
          <div className="h-10 w-24 rounded-t bg-muted" />
          <div className="h-10 w-24 rounded-t bg-muted" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg border bg-card p-4">
              <div className="h-4 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}