export const WORLD_CENTER: [number, number] = [20, 0];
export const WORLD_ZOOM = 2;

// Esri's Light Gray Canvas: genuinely free (no key, no signup) raster tiles, split into a
// base layer (land/water fills) and a reference layer (labels/borders) stacked on top —
// a muted, near-monochrome basemap so the brand-orange pins read as the one intentional
// accent color instead of competing with a busy map for attention.
export const TILE_URL_BASE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
export const TILE_URL_REFERENCE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
export const TILE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors";
export const TILE_MAX_ZOOM = 16;
