import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";

/**
 * MapLibre's built-in NavigationControl renders its +/- as plain text glyphs in a system
 * font — fine functionally, but it reads as generic library chrome next to the rest of the
 * app's custom iconography. This swaps in real stroke-drawn SVG icons on buttons styled like
 * every other control in the app (white surface, `shadow-card`, brand-tinted hover).
 */
export function MapZoomControls({ mapRef }: { mapRef: RefObject<MapRef | null> }) {
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-card">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => mapRef.current?.getMap().zoomIn({ duration: 200 })}
        className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:bg-brand-50 hover:text-brand-600"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M8 2v12M2 8h12" />
        </svg>
      </button>
      <div className="h-px bg-neutral-100" />
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => mapRef.current?.getMap().zoomOut({ duration: 200 })}
        className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:bg-brand-50 hover:text-brand-600"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 8h12" />
        </svg>
      </button>
    </div>
  );
}
