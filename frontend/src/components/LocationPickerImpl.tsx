import { useRef } from "react";
import { Map, Marker, NavigationControl, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, WORLD_ZOOM } from "../lib/mapConfig";
import { BrandPin } from "./BrandPin";

interface Props {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

export function LocationPicker({ position, onChange }: Props) {
  const mapRef = useRef<MapRef>(null);

  function handleClick(e: MapLayerMouseEvent) {
    onChange([e.lngLat.lat, e.lngLat.lng]);
  }

  // See RestaurantMapImpl for why this is needed — the container isn't reliably sized yet
  // the instant the map mounts behind a Suspense boundary.
  function handleLoad() {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // See RestaurantMapImpl for why this is needed — guarantees the first paint happens
    // even if the browser hasn't scheduled this tab's first animation frame yet.
    requestAnimationFrame(() => map.triggerRepaint());
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);
    map.once("remove", () => observer.disconnect());
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: position[1], latitude: position[0], zoom: WORLD_ZOOM }}
      mapStyle={MAP_STYLE_URL}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={handleClick}
      onLoad={handleLoad}
      cursor="crosshair"
    >
      <NavigationControl position="top-left" showCompass={false} />
      <Marker longitude={position[1]} latitude={position[0]} anchor="bottom">
        <BrandPin active />
      </Marker>
    </Map>
  );
}
