import { APIProvider, Map, Marker, type MapMouseEvent } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY } from "../lib/mapConfig";

interface Props {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

export function GoogleLocationPicker({ position, onChange }: Props) {
  function handleClick(e: MapMouseEvent) {
    const latLng = e.detail.latLng;
    if (latLng) onChange([latLng.lat, latLng.lng]);
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={{ lat: position[0], lng: position[1] }}
        defaultZoom={2}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="foodtok-map"
        onClick={handleClick}
      >
        <Marker position={{ lat: position[0], lng: position[1] }} />
      </Map>
    </APIProvider>
  );
}
