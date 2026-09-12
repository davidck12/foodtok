import { setWorkerUrl } from "maplibre-gl";
// eslint-disable-next-line import/no-unresolved
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

// MapLibre normally locates its tile-parsing worker script by resolving a relative path
// against its own bundled import.meta.url. Bundlers (Vite in dev *and* in a production
// build) relocate/hash the module without relocating that sibling file, so the guessed URL
// 404s and the map never leaves the "loading" state. Pointing it at an explicit, bundler-
// tracked URL sidesteps the guesswork entirely.
setWorkerUrl(maplibreWorkerUrl);

export const WORLD_CENTER: [number, number] = [20, 0];
export const WORLD_ZOOM = 1.6;

// OpenFreeMap: genuinely free (no key, no signup, no rate limit) vector tiles rendered via
// MapLibre GL — smooth zoom/pan, crisp at any DPI, modern styling much closer to Google/Apple
// Maps than static raster tiles. https://openfreemap.org
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
