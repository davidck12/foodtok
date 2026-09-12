import { GoogleRestaurantMap } from "./GoogleRestaurantMap";
import { LeafletRestaurantMap } from "./LeafletRestaurantMap";
import { HAS_GOOGLE_MAPS } from "../lib/mapConfig";
import type { Restaurant } from "../types";

interface Props {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  interactiveMarkers?: boolean;
}

export function RestaurantMap(props: Props) {
  return HAS_GOOGLE_MAPS ? <GoogleRestaurantMap {...props} /> : <LeafletRestaurantMap {...props} />;
}
