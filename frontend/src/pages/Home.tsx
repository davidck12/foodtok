import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "../api/client";
import { RestaurantCard } from "../components/RestaurantCard";
import { RestaurantCardSkeleton } from "../components/RestaurantCardSkeleton";
import { RestaurantMap } from "../components/RestaurantMap";
import { RestaurantSearchInput } from "../components/RestaurantSearchInput";
import { distanceKm } from "../lib/geo";
import { useDebounce } from "../lib/useDebounce";
import type { Restaurant, RestaurantSuggestion } from "../types";

type SortBy = "relevance" | "rating" | "distance";

export function Home() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const debouncedQ = useDebounce(q, 300);

  function handleSortChange(next: SortBy) {
    setSortBy(next);
    setLocationError(null);
    if (next === "distance" && !userLocation) {
      if (!navigator.geolocation) {
        setLocationError("Your browser doesn't support location.");
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setFocus(loc);
          setLocating(false);
        },
        () => {
          setLocationError("Couldn't get your location. Check your browser's location permission.");
          setLocating(false);
          setSortBy("relevance");
        },
        { enableHighAccuracy: false, timeout: 10_000 },
      );
    }
  }

  const { data: cuisines } = useQuery({
    queryKey: ["cuisines"],
    queryFn: async () => (await api.get<{ cuisines: string[] }>("/restaurants/cuisines")).data.cuisines,
  });

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants", debouncedQ, cuisine],
    queryFn: async () =>
      (
        await api.get<{ restaurants: Restaurant[] }>("/restaurants", {
          params: { q: debouncedQ || undefined, cuisine: cuisine || undefined },
        })
      ).data.restaurants,
  });

  function handleQueryChange(next: string) {
    setQ(next);
    setFocus(null);
  }

  function handleSuggestionSelect(suggestion: RestaurantSuggestion) {
    setQ(suggestion.name);
    setFocus({ lat: suggestion.lat, lng: suggestion.lng });
  }

  const sortedRestaurants = useMemo(() => {
    if (!restaurants) return restaurants;
    if (sortBy === "rating") {
      return [...restaurants].sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    }
    if (sortBy === "distance" && userLocation) {
      return [...restaurants].sort((a, b) => distanceKm(userLocation, a) - distanceKm(userLocation, b));
    }
    return restaurants;
  }, [restaurants, sortBy, userLocation]);

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-50 via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="font-display inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-sm ring-1 ring-brand-100">
            🌍 Every restaurant, everywhere
          </span>
          <h1 className="font-display mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            Find your next favorite meal
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-neutral-500 sm:text-lg">
            Real reviews from tourists and locals — no algorithm, just good food.
          </p>

          <div className="relative z-10 mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-md sm:flex-row sm:items-center">
            <RestaurantSearchInput
              value={q}
              onChange={handleQueryChange}
              onSelect={handleSuggestionSelect}
              placeholder="Search restaurants by name…"
            />
            <div className="hidden h-6 w-px bg-neutral-200 sm:block" />
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700 focus:outline-none sm:bg-transparent"
            >
              <option value="">All cuisines</option>
              {cuisines?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              {!isLoading && restaurants && (
                <p className="text-sm text-neutral-500">
                  {restaurants.length} place{restaurants.length === 1 ? "" : "s"} found
                </p>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSortChange("distance")}
                  disabled={locating}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    sortBy === "distance"
                      ? "border-brand-200 bg-brand-50 text-brand-700"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  } disabled:opacity-60`}
                >
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10 18s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" strokeLinejoin="round" />
                    <circle cx="10" cy="8" r="2" />
                  </svg>
                  {locating ? "Locating…" : "Near me"}
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortBy)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 focus:outline-none"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="rating">Sort: Top rated</option>
                  <option value="distance">Sort: Nearest</option>
                </select>
              </div>
            </div>
            {locationError && <p className="mb-3 text-xs text-red-500">{locationError}</p>}
            {!isLoading && restaurants?.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
                <span className="text-3xl">🔍</span>
                <p className="font-medium text-neutral-700">No restaurants match your search yet</p>
                <p className="text-sm text-neutral-400">Try a different name, or add it yourself.</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
                : sortedRestaurants?.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      distanceKm={userLocation ? distanceKm(userLocation, r) : undefined}
                    />
                  ))}
            </div>
          </div>
          <div className="h-[420px] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
            {restaurants && (
              <RestaurantMap
                restaurants={restaurants}
                center={focus ? [focus.lat, focus.lng] : undefined}
                zoom={focus ? 14 : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
