import { lazy, Suspense, type ComponentProps } from "react";

const Impl = lazy(() => import("./LocationPickerImpl").then((m) => ({ default: m.LocationPicker })));

export function LocationPicker(props: ComponentProps<typeof Impl>) {
  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-neutral-100" />}>
      <Impl {...props} />
    </Suspense>
  );
}
