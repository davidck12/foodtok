import L from "leaflet";

// A crisp inline-SVG pin in brand orange, rendered via divIcon instead of
// bitmap marker images — sharper at every zoom/DPI and matches the palette.
const PIN_SVG = `
<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" class="foodtok-pin">
  <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="#f8500a"/>
  <circle cx="15" cy="15" r="6.5" fill="white"/>
</svg>`;

export const brandMarkerIcon = L.divIcon({
  html: PIN_SVG,
  className: "",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
});
