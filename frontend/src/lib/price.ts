// Restaurants store an average price per person (in whatever the creator typed,
// treated as USD). This buckets that into the familiar $–$$$$ symbol for compact
// display, the same convention Google/Yelp use.
export function priceSymbol(avgPrice: number | null | undefined): string {
  if (!avgPrice) return "";
  if (avgPrice <= 15) return "$";
  if (avgPrice <= 30) return "$$";
  if (avgPrice <= 60) return "$$$";
  return "$$$$";
}
