export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="mt-2 h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
      </header>

      <section className="mt-6 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-md border bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}