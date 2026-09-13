import L from "leaflet";

// A crisp inline-SVG pin in brand orange, rendered via divIcon instead of a bitmap marker
// image — sharper at every zoom/DPI and matches the app's palette exactly.
function pinSvg(active: boolean) {
  const size = active ? [34, 46] : [28, 38];
  return `
<svg width="${size[0]}" height="${size[1]}" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(15,15,15,0.3))">
  <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="${active ? "#e93800" : "#f8500a"}"/>
  <circle cx="15" cy="15" r="6.5" fill="white"/>
</svg>`;
}

export function brandMarkerIcon(active = false) {
  const [w, h] = active ? [34, 46] : [28, 38];
  return L.divIcon({
    html: pinSvg(active),
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
  });
}
