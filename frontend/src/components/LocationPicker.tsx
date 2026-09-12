import { GoogleLocationPicker } from "./GoogleLocationPicker";
import { LeafletLocationPicker } from "./LeafletLocationPicker";
import { HAS_GOOGLE_MAPS } from "../lib/mapConfig";

interface Props {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

export function LocationPicker(props: Props) {
  return HAS_GOOGLE_MAPS ? <GoogleLocationPicker {...props} /> : <LeafletLocationPicker {...props} />;
}
