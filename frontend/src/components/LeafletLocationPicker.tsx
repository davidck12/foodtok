import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { WORLD_ZOOM } from "../lib/mapConfig";
import { brandMarkerIcon } from "../lib/markerIcon";

interface Props {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

function ClickHandler({ onChange }: Pick<Props, "onChange">) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export function LeafletLocationPicker({ position, onChange }: Props) {
  return (
    <MapContainer center={position} zoom={WORLD_ZOOM} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      <Marker position={position} icon={brandMarkerIcon} />
      <ClickHandler onChange={onChange} />
    </MapContainer>
  );
}
