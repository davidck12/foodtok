import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { WORLD_CENTER, WORLD_ZOOM } from "../lib/mapConfig";
import { brandMarkerIcon } from "../lib/markerIcon";
import { priceSymbol } from "../lib/price";
import type { Restaurant } from "../types";

interface Props {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  interactiveMarkers?: boolean;
}

function FitToMarkers({ restaurants, skip }: { restaurants: Restaurant[]; skip: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (skip || restaurants.length < 2) return;
    const bounds = restaurants.map((r) => [r.lat, r.lng] as [number, number]);
    // The container's real size isn't settled the instant this effect fires (it sits in a
    // CSS grid column whose height depends on a sibling), so an immediate fitBounds can compute
    // zoom against a stale/zero size. invalidateSize + a rAF defer fixes that reliably.
    requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [48, 48] });
    });
  }, [map, restaurants, skip]);

  return null;
}

// react-leaflet's `center`/`zoom` props on MapContainer only apply once, at mount — changing
// them later (e.g. the user picks a search suggestion) does nothing on its own. This imperatively
// flies the live map to a new center whenever the caller passes one in.
function FlyToCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    map.flyTo(center, zoom, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);

  return null;
}

export function LeafletRestaurantMap({ restaurants, center, zoom, interactiveMarkers = true }: Props) {
  const navigate = useNavigate();
  const single = restaurants.length === 1 ? restaurants[0] : null;

  const mapCenter: [number, number] = center ?? (single ? [single.lat, single.lng] : WORLD_CENTER);
  const mapZoom = zoom ?? (single ? 15 : restaurants.length === 0 ? WORLD_ZOOM : 12);

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      {center ? <FlyToCenter center={center} zoom={mapZoom} /> : <FitToMarkers restaurants={restaurants} skip={false} />}
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={brandMarkerIcon}
          eventHandlers={
            interactiveMarkers ? { click: () => navigate(`/restaurants/${r.id}`) } : undefined
          }
        >
          <Popup>
            <div className="min-w-[140px]">
              <p className="font-display text-sm font-semibold text-neutral-900">{r.name}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {r.cuisine}
                {r.priceRange > 0 && ` · ${priceSymbol(r.priceRange)}`}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
