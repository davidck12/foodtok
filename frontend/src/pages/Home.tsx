import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { RestaurantCard } from "../components/RestaurantCard";
import { RestaurantMap } from "../components/RestaurantMap";
import type { Restaurant } from "../types";

export function Home() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("");

  const { data: cuisines } = useQuery({
    queryKey: ["cuisines"],
    queryFn: async () => (await api.get<{ cuisines: string[] }>("/restaurants/cuisines")).data.cuisines,
  });

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants", q, cuisine],
    queryFn: async () =>
      (
        await api.get<{ restaurants: Restaurant[] }>("/restaurants", {
          params: { q: q || undefined, cuisine: cuisine || undefined },
        })
      ).data.restaurants,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Find your next favorite meal</h1>
        <p className="mt-2 text-neutral-500">
          Real reviews from tourists and locals — no algorithm, just good food.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search restaurants by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All cuisines</option>
          {cuisines?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {isLoading && <p className="text-neutral-500">Loading restaurants…</p>}
          {!isLoading && restaurants?.length === 0 && (
            <p className="text-neutral-500">No restaurants match your search yet.</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {restaurants?.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
        <div className="h-[500px] overflow-hidden rounded-xl border border-neutral-200 lg:col-span-2 lg:h-auto">
          {restaurants && <RestaurantMap restaurants={restaurants} />}
        </div>
      </div>
    </div>
  );
}
