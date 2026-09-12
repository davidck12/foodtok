export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="h-36 w-full animate-pulse bg-neutral-100" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}
