import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, WORLD_CENTER, WORLD_ZOOM } from "../lib/mapConfig";
import { priceSymbol } from "../lib/price";
import type { Restaurant } from "../types";
import { BrandPin } from "./BrandPin";
import { MapZoomControls } from "./MapZoomControls";
import { StarRating } from "./StarRating";

interface Props {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  interactiveMarkers?: boolean;
}

export function RestaurantMap({ restaurants, center, zoom, interactiveMarkers = true }: Props) {
  const navigate = useNavigate();
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const isFirstRender = useRef(true);

  const single = restaurants.length === 1 ? restaurants[0] : null;
  const initialCenter: [number, number] = center ?? (single ? [single.lat, single.lng] : WORLD_CENTER);
  const initialZoom = zoom ?? (single ? 15 : WORLD_ZOOM);

  // Frames the map to whatever `center`/`restaurants` currently describe. Used both for the
  // initial load (instant, no animation — the guessed initialViewState above is a rough
  // placeholder) and for later prop changes (animated), so the two paths can't drift apart.
  function applyView(animate: boolean) {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const opts = animate ? { duration: 900 } : { duration: 0 };

    if (center) {
      map.flyTo({ center: [center[1], center[0]], zoom: zoom ?? 14, ...opts });
    } else if (restaurants.length >= 2) {
      const lngs = restaurants.map((r) => r.lng);
      const lats = restaurants.map((r) => r.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 56, maxZoom: 15, ...opts },
      );
    } else if (restaurants.length === 1) {
      map.flyTo({ center: [restaurants[0].lng, restaurants[0].lat], zoom: 15, ...opts });
    } else {
      map.flyTo({ center: [WORLD_CENTER[1], WORLD_CENTER[0]], zoom: WORLD_ZOOM, ...opts });
    }
  }

  // The map only reads its initial view once (`initialViewState`) — everything after that
  // (a search suggestion pick, the result set changing) has to move the live map imperatively.
  // The very first framing happens in `handleLoad` instead (instant, once the map exists);
  // this effect only reacts to genuine changes after that.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    applyView(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1], restaurants]);

  // MapLibre measures its container once at init. That container sits behind a Suspense
  // boundary inside a sticky CSS-grid column, so its real size isn't settled yet at that
  // instant — the map's internal canvas silently ends up 0px tall. A ResizeObserver keeps
  // it correctly sized from then on, covering the first paint and any later layout shift.
  function handleLoad() {
    const map = mapRef.current?.getMap();
    if (!map) return;
    applyView(false);
    // The instant fitBounds/flyTo call above can land before the browser has scheduled this
    // tab's first animation frame, so MapLibre's own render loop occasionally never kicks in
    // until something else (a click, a resize) nudges it — leaving a loaded-but-blank canvas.
    // An explicit repaint request on the next frame guarantees that first paint happens.
    requestAnimationFrame(() => map.triggerRepaint());
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);
    map.once("remove", () => observer.disconnect());
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: initialCenter[1], latitude: initialCenter[0], zoom: initialZoom }}
      mapStyle={MAP_STYLE_URL}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onLoad={handleLoad}
    >
      <MapZoomControls mapRef={mapRef} />
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          longitude={r.lng}
          latitude={r.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            if (interactiveMarkers) setSelected(r);
          }}
        >
          <BrandPin active={selected?.id === r.id} />
        </Marker>
      ))}
      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={44}
          closeOnClick={false}
          onClose={() => setSelected(null)}
          className="foodtok-popup"
        >
          <button
            onClick={() => navigate(`/restaurants/${selected.id}`)}
            className="flex w-48 flex-col gap-1 p-1 text-left"
          >
            <span className="font-display text-sm font-semibold text-neutral-900">{selected.name}</span>
            <span className="text-xs text-neutral-500">
              {selected.cuisine}
              {selected.priceRange > 0 && ` · ${priceSymbol(selected.priceRange)}`}
            </span>
            {selected.avgRating != null && (
              <span className="flex items-center gap-1">
                <StarRating value={selected.avgRating} size="sm" />
                <span className="text-xs text-neutral-500">{selected.avgRating.toFixed(1)}</span>
              </span>
            )}
            <span className="mt-1 text-xs font-semibold text-brand-600">View restaurant →</span>
          </button>
        </Popup>
      )}
    </Map>
  );
}
