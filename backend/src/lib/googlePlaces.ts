// Thin client for the Places API (New). Every call degrades to an empty
// result instead of throwing when GOOGLE_PLACES_API_KEY isn't configured,
// so the rest of the app works fine before/without Google integration.
//
// We deliberately do NOT persist review text, author info, or photos from
// Google in the database — Google's terms restrict long-term caching of
// that content. We only ever store the place_id (a stable identifier) plus
// a lightweight rating snapshot, and fetch live review content on demand
// through the short in-memory cache below.

const PLACES_API_BASE = "https://places.googleapis.com/v1";

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
}

export interface GooglePlaceSummary {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  cuisine: string;
  rating: number | null;
  reviewCount: number | null;
}

export interface GooglePlaceDetails extends GooglePlaceSummary {
  mapsUrl: string | null;
  reviews: GoogleReview[];
}

function apiKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY || null;
}

function guessCuisine(types: string[] | undefined): string {
  const skip = new Set(["restaurant", "food", "point_of_interest", "establishment"]);
  const specific = (types ?? []).find((t) => !skip.has(t));
  if (!specific) return "Restaurant";
  return specific
    .replace(/_restaurant$/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Cheap TTL cache — fine for a single-instance deploy; swap for Redis if scaling out.
const searchCache = new Map<string, { at: number; data: GooglePlaceSummary[] }>();
const detailsCache = new Map<string, { at: number; data: GooglePlaceDetails | null }>();
const SEARCH_TTL_MS = 10 * 60 * 1000;
const DETAILS_TTL_MS = 6 * 60 * 60 * 1000;

export async function searchGooglePlaces(query: string): Promise<GooglePlaceSummary[]> {
  const key = apiKey();
  if (!key || !query.trim()) return [];

  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.at < SEARCH_TTL_MS) return cached.data;

  try {
    const res = await fetch(`${PLACES_API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types",
      },
      body: JSON.stringify({ textQuery: `${query} restaurant`, maxResultCount: 10 }),
    });

    if (!res.ok) {
      console.error("Google Places search failed", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text: string };
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        rating?: number;
        userRatingCount?: number;
        types?: string[];
      }>;
    };

    const results: GooglePlaceSummary[] = (data.places ?? []).map((p) => ({
      placeId: p.id,
      name: p.displayName?.text ?? "Unknown",
      address: p.formattedAddress ?? "",
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      cuisine: guessCuisine(p.types),
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
    }));

    searchCache.set(query, { at: Date.now(), data: results });
    return results;
  } catch (err) {
    console.error("Google Places search error", err);
    return [];
  }
}

export async function getGooglePlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  const key = apiKey();
  if (!key) return null;

  const cached = detailsCache.get(placeId);
  if (cached && Date.now() - cached.at < DETAILS_TTL_MS) return cached.data;

  try {
    const res = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,location,rating,userRatingCount,types,googleMapsUri,reviews",
      },
    });

    if (!res.ok) {
      console.error("Google Places details failed", res.status, await res.text());
      detailsCache.set(placeId, { at: Date.now(), data: null });
      return null;
    }

    const p = (await res.json()) as {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      rating?: number;
      userRatingCount?: number;
      types?: string[];
      googleMapsUri?: string;
      reviews?: Array<{
        authorAttribution?: { displayName: string; photoUri?: string };
        rating: number;
        text?: { text: string };
        relativePublishTimeDescription?: string;
        publishTime: string;
      }>;
    };

    const details: GooglePlaceDetails = {
      placeId: p.id,
      name: p.displayName?.text ?? "Unknown",
      address: p.formattedAddress ?? "",
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      cuisine: guessCuisine(p.types),
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
      mapsUrl: p.googleMapsUri ?? null,
      reviews: (p.reviews ?? []).map((r) => ({
        authorName: r.authorAttribution?.displayName ?? "Google user",
        authorPhotoUrl: r.authorAttribution?.photoUri ?? null,
        rating: r.rating,
        text: r.text?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime,
      })),
    };

    detailsCache.set(placeId, { at: Date.now(), data: details });
    return details;
  } catch (err) {
    console.error("Google Places details error", err);
    return null;
  }
}
