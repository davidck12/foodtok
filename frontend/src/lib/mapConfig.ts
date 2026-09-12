// Live Google Maps needs a browser-side API key restricted to this site's
// domain(s) in Cloud Console — separate from the backend's Places API key,
// which must stay server-only. Falls back to OpenStreetMap/Leaflet when unset
// so the app keeps working before that key exists.
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
export const HAS_GOOGLE_MAPS = Boolean(GOOGLE_MAPS_API_KEY);

export const WORLD_CENTER: [number, number] = [20, 0];
export const WORLD_ZOOM = 2;
