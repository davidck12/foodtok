import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { RestaurantCard } from "../components/RestaurantCard";
import { RestaurantCardSkeleton } from "../components/RestaurantCardSkeleton";
import { RestaurantMap } from "../components/RestaurantMap";
import { RestaurantSearchInput } from "../components/RestaurantSearchInput";
import { useDebounce } from "../lib/useDebounce";
import type { Restaurant, RestaurantSuggestion } from "../types";

export function Home() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  const debouncedQ = useDebounce(q, 300);

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
            {!isLoading && restaurants && (
              <p className="mb-3 text-sm text-neutral-500">
                {restaurants.length} place{restaurants.length === 1 ? "" : "s"} found
              </p>
            )}
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
                : restaurants?.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
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
