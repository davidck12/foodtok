import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Map as LeafletMap } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL_BASE, TILE_URL_REFERENCE, WORLD_CENTER, WORLD_ZOOM } from "../lib/mapConfig";
import { brandMarkerIcon } from "../lib/markerIcon";
import { priceSymbol } from "../lib/price";
import type { Restaurant } from "../types";
import { MapZoomControls } from "./MapZoomControls";
import { StarRating } from "./StarRating";

interface Props {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  interactiveMarkers?: boolean;
}

// react-leaflet's `center`/`zoom` props on MapContainer only apply once, at mount — changing
// them later (a search suggestion pick, the result set changing) does nothing on its own.
// This drives the live map imperatively whenever the caller passes a new view to frame.
function ViewController({ restaurants, center, zoom }: Props) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The container's real size isn't settled the instant this mounts (it sits behind a
    // Suspense boundary inside a sticky CSS-grid column), so a fitBounds/flyTo computed
    // against a stale size can be wrong. invalidateSize before each move fixes that.
    map.invalidateSize();

    if (center) {
      map.flyTo(center, zoom ?? 14, { duration: isFirstRender.current ? 0 : 0.8 });
    } else if (restaurants.length >= 2) {
      const bounds = restaurants.map((r) => [r.lat, r.lng] as [number, number]);
      map.flyToBounds(bounds, { padding: [48, 48], duration: isFirstRender.current ? 0 : 0.8 });
    } else if (restaurants.length === 1) {
      map.flyTo([restaurants[0].lat, restaurants[0].lng], 15, { duration: isFirstRender.current ? 0 : 0.8 });
    } else {
      map.flyTo(WORLD_CENTER, WORLD_ZOOM, { duration: isFirstRender.current ? 0 : 0.8 });
    }
    isFirstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center?.[0], center?.[1], zoom, restaurants]);

  return null;
}

// The container can still resize after mount (layout shifts as sibling content loads) —
// keep the map's internal size in sync so tiles never render into a stale, clipped canvas.
function ResizeSync() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export function RestaurantMap({ restaurants, center, zoom, interactiveMarkers = true }: Props) {
  const navigate = useNavigate();
  const mapRef = useRef<LeafletMap | null>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const single = restaurants.length === 1 ? restaurants[0] : null;
  const initialCenter: [number, number] = center ?? (single ? [single.lat, single.lng] : WORLD_CENTER);
  const initialZoom = zoom ?? (single ? 15 : WORLD_ZOOM);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        zoomControl={false}
        scrollWheelZoom={false}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL_BASE} maxZoom={TILE_MAX_ZOOM} />
        <TileLayer url={TILE_URL_REFERENCE} maxZoom={TILE_MAX_ZOOM} />
        <ViewController restaurants={restaurants} center={center} zoom={zoom} />
        <ResizeSync />
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={brandMarkerIcon(selected?.id === r.id)}
            eventHandlers={
              interactiveMarkers
                ? { click: () => setSelected(r), popupclose: () => setSelected((s) => (s?.id === r.id ? null : s)) }
                : undefined
            }
            interactive={interactiveMarkers}
          >
            {interactiveMarkers && (
              <Popup minWidth={180}>
                <button onClick={() => navigate(`/restaurants/${r.id}`)} className="flex w-full flex-col gap-1 text-left">
                  <span className="font-display text-sm font-semibold text-neutral-900">{r.name}</span>
                  <span className="text-xs text-neutral-500">
                    {r.cuisine}
                    {r.priceRange > 0 && ` · ${priceSymbol(r.priceRange)}`}
                  </span>
                  {r.avgRating != null && (
                    <span className="flex items-center gap-1">
                      <StarRating value={r.avgRating} size="sm" />
                      <span className="text-xs text-neutral-500">{r.avgRating.toFixed(1)}</span>
                    </span>
                  )}
                  <span className="mt-1 text-xs font-semibold text-brand-600">View restaurant →</span>
                </button>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      <MapZoomControls mapRef={mapRef} />
    </div>
  );
}
