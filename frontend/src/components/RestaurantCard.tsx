import { Link } from "react-router-dom";
import { priceSymbol } from "../lib/price";
import type { Restaurant } from "../types";
import { StarRating } from "./StarRating";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const price = priceSymbol(restaurant.priceRange);

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-brand-50 to-neutral-100">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
        )}
        {restaurant.avgRating != null && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-800 shadow-sm backdrop-blur">
            <span className="text-brand-500">★</span>
            {restaurant.avgRating.toFixed(1)}
          </span>
        )}
        {restaurant.source === "google" && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-neutral-500 shadow-sm backdrop-blur">
            via Google
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold leading-snug text-neutral-900">{restaurant.name}</h3>
          {price && <span className="shrink-0 text-sm font-medium text-neutral-400">{price}</span>}
        </div>
        <p className="text-sm text-neutral-500">
          {restaurant.cuisine} · {restaurant.city}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          {restaurant.avgRating ? (
            <>
              <StarRating value={restaurant.avgRating} size="sm" />
              <span className="text-xs text-neutral-500">({restaurant.reviewCount})</span>
            </>
          ) : (
            <span className="text-xs text-neutral-400">No reviews yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}
