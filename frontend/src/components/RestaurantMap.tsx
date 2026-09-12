import { lazy, Suspense, type ComponentProps } from "react";

// MapLibre GL is a large dependency (~1MB) — split it into its own chunk so pages that don't
// show a map (login, register, profile) don't pay for it on first load.
const Impl = lazy(() => import("./RestaurantMapImpl").then((m) => ({ default: m.RestaurantMap })));

export function RestaurantMap(props: ComponentProps<typeof Impl>) {
  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-neutral-100" />}>
      <Impl {...props} />
    </Suspense>
  );
}
