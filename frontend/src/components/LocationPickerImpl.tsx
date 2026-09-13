import { useEffect, useRef } from "react";
import { Map, Marker, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, WORLD_ZOOM } from "../lib/mapConfig";
import { BrandPin } from "./BrandPin";
import { MapZoomControls } from "./MapZoomControls";

interface Props {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

export function LocationPicker({ position, onChange }: Props) {
  const mapRef = useRef<MapRef>(null);
  const isFirstRender = useRef(true);
  const fromClick = useRef(false);

  function handleClick(e: MapLayerMouseEvent) {
    fromClick.current = true;
    onChange([e.lngLat.lat, e.lngLat.lng]);
  }

  // A click already visually centers itself where the user tapped — only fly the camera
  // for position changes from elsewhere (e.g. the parent defaulting to the user's real
  // location once geolocation resolves after mount).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (fromClick.current) {
      fromClick.current = false;
      return;
    }
    mapRef.current?.getMap().flyTo({ center: [position[1], position[0]], zoom: 15, duration: 900 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);

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
      <MapZoomControls mapRef={mapRef} />
      <Marker longitude={position[1]} latitude={position[0]} anchor="bottom">
        <BrandPin active />
      </Marker>
    </Map>
  );
}
