import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { StarRating } from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import type { MyReview } from "../types";

export function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["myReviews"],
    queryFn: async () => (await api.get<{ reviews: MyReview[] }>("/reviews/mine")).data.reviews,
  });

  async function handleDelete(id: string) {
    try {
      await api.delete(`/reviews/${id}`);
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
      toast.success("Review deleted");
    } catch {
      toast.error("Could not delete review");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
          {user?.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">My reviews</h1>
          <p className="text-sm text-neutral-500">Signed in as {user?.email}</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      )}
      {!isLoading && reviews?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <span className="text-3xl">📝</span>
          <p className="font-medium text-neutral-700">You haven't reviewed anywhere yet</p>
          <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
            Find a place to review
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {reviews?.map((review) => (
          <div key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <Link to={`/restaurants/${review.restaurant.id}`} className="font-display font-semibold text-neutral-900 hover:underline">
                {review.restaurant.name}
              </Link>
              <StarRating value={review.rating} size="sm" />
            </div>
            <p className="text-xs text-neutral-400">{review.restaurant.city}</p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{review.text}</p>
            <button
              onClick={() => handleDelete(review.id)}
              className="mt-3 text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
            >
              Delete review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
