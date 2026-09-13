import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL_BASE, TILE_URL_REFERENCE, WORLD_ZOOM } from "../lib/mapConfig";
import { brandMarkerIcon } from "../lib/markerIcon";
import { MapZoomControls } from "./MapZoomControls";

interface Props {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

function ClickHandler({ onChange, fromClick }: { onChange: Props["onChange"]; fromClick: React.RefObject<boolean> }) {
  useMapEvents({
    click(e) {
      fromClick.current = true;
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// A click already visually centers itself where the user tapped — only fly the camera for
// position changes from elsewhere (e.g. the parent defaulting to the user's real location
// once geolocation resolves after mount).
function ViewController({ position, fromClick }: { position: [number, number]; fromClick: React.RefObject<boolean> }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    map.invalidateSize();
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (fromClick.current) {
      fromClick.current = false;
      return;
    }
    map.flyTo(position, 15, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position[0], position[1]]);

  return null;
}

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

export function LocationPicker({ position, onChange }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const fromClick = useRef(false);

  return (
    <div className="relative h-full w-full cursor-crosshair">
      <MapContainer
        center={position}
        zoom={WORLD_ZOOM}
        zoomControl={false}
        scrollWheelZoom={false}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL_BASE} maxZoom={TILE_MAX_ZOOM} />
        <TileLayer url={TILE_URL_REFERENCE} maxZoom={TILE_MAX_ZOOM} />
        <ViewController position={position} fromClick={fromClick} />
        <ResizeSync />
        <ClickHandler onChange={onChange} fromClick={fromClick} />
        <Marker position={position} icon={brandMarkerIcon(true)} />
      </MapContainer>
      <MapZoomControls mapRef={mapRef} />
    </div>
  );
}
