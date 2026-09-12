import L from "leaflet";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { WORLD_CENTER, WORLD_ZOOM } from "../lib/mapConfig";
import type { Restaurant } from "../types";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
    map.fitBounds(
      restaurants.map((r) => [r.lat, r.lng] as [number, number]),
      { padding: [48, 48] },
    );
  }, [map, restaurants, skip]);

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers restaurants={restaurants} skip={Boolean(center)} />
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={defaultIcon}
          eventHandlers={
            interactiveMarkers ? { click: () => navigate(`/restaurants/${r.id}`) } : undefined
          }
        >
          <Popup>
            <strong>{r.name}</strong>
            <br />
            {r.cuisine}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
