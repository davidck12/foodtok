import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
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
    const bounds = new google.maps.LatLngBounds();
    restaurants.forEach((r) => bounds.extend({ lat: r.lat, lng: r.lng }));
    map.fitBounds(bounds, 48);
  }, [map, restaurants, skip]);

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
        <FitToMarkers restaurants={restaurants} skip={Boolean(center)} />
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
