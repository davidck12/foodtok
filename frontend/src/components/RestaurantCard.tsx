import { Link } from "react-router-dom";
import { priceSymbol } from "../lib/price";
import type { Restaurant } from "../types";
import { StarRating } from "./StarRating";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="h-36 w-full bg-neutral-100">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900">{restaurant.name}</h3>
          <span className="shrink-0 text-sm text-neutral-500">{priceSymbol(restaurant.priceRange)}</span>
        </div>
        <p className="text-sm text-neutral-500">
          {restaurant.cuisine} · {restaurant.city}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          {restaurant.avgRating ? (
            <>
              <StarRating value={restaurant.avgRating} size="sm" />
              <span className="text-xs text-neutral-500">
                {restaurant.avgRating.toFixed(1)} ({restaurant.reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs text-neutral-400">No reviews yet</span>
          )}
          {restaurant.source === "google" && (
            <span className="ml-auto text-xs text-neutral-400">via Google</span>
          )}
        </div>
      </div>
    </Link>
  );
}
