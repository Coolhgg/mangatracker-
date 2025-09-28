export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export const SeriesCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <div className="aspect-[3/4] w-full bg-muted" />
    <div className="p-4 space-y-2">
      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
    </div>
  </div>
);

export const ThumbnailSkeleton = () => (
  <div className="aspect-square w-full rounded-md bg-muted animate-pulse" />
);

export const Skeletons = {
  Card: SeriesCardSkeleton,
  Thumbnail: ThumbnailSkeleton,
};