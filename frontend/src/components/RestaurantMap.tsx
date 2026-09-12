import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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

export function RestaurantMap({ restaurants, center, zoom = 13, interactiveMarkers = true }: Props) {
  const navigate = useNavigate();
  const mapCenter: [number, number] =
    center ?? (restaurants[0] ? [restaurants[0].lat, restaurants[0].lng] : [38.7223, -9.1393]);

  return (
    <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
