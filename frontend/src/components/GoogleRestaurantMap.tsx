import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GOOGLE_MAPS_API_KEY, WORLD_CENTER, WORLD_ZOOM } from "../lib/mapConfig";
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
    if (skip || !map || restaurants.length < 2) return;
    requestAnimationFrame(() => {
      const bounds = new google.maps.LatLngBounds();
      restaurants.forEach((r) => bounds.extend({ lat: r.lat, lng: r.lng }));
      map.fitBounds(bounds, 48);
    });
  }, [map, restaurants, skip]);

  return null;
}

// The Map component's `defaultCenter`/`defaultZoom` only apply at mount — this imperatively
// pans the live map whenever the caller passes a new center in (e.g. a search suggestion pick).
function FlyToCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!map) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    map.panTo({ lat: center[0], lng: center[1] });
    map.setZoom(zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center[0], center[1], zoom]);

  return null;
}

export function GoogleRestaurantMap({ restaurants, center, zoom, interactiveMarkers = true }: Props) {
  const navigate = useNavigate();
  const single = restaurants.length === 1 ? restaurants[0] : null;

  const defaultCenter = center ?? (single ? [single.lat, single.lng] : WORLD_CENTER);
  const defaultZoom = zoom ?? (single ? 15 : restaurants.length === 0 ? WORLD_ZOOM : 12);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={{ lat: defaultCenter[0], lng: defaultCenter[1] }}
        defaultZoom={defaultZoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="foodtok-map"
      >
        {center ? (
          <FlyToCenter center={center} zoom={defaultZoom} />
        ) : (
          <FitToMarkers restaurants={restaurants} skip={false} />
        )}
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            position={{ lat: r.lat, lng: r.lng }}
            title={`${r.name} — ${r.cuisine}`}
            onClick={interactiveMarkers ? () => navigate(`/restaurants/${r.id}`) : undefined}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
