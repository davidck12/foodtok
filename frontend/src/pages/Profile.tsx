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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">My reviews</h1>
      <p className="mb-6 text-neutral-500">Signed in as {user?.email}</p>

      {isLoading && <p className="text-neutral-500">Loading…</p>}
      {!isLoading && reviews?.length === 0 && (
        <p className="text-neutral-500">
          You haven't reviewed anywhere yet. <Link to="/" className="text-brand-600 hover:underline">Find a place</Link>.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {reviews?.map((review) => (
          <div key={review.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <Link to={`/restaurants/${review.restaurant.id}`} className="font-medium text-neutral-900 hover:underline">
                {review.restaurant.name}
              </Link>
              <StarRating value={review.rating} size="sm" />
            </div>
            <p className="text-xs text-neutral-400">{review.restaurant.city}</p>
            <p className="mt-2 text-sm text-neutral-700">{review.text}</p>
            <button
              onClick={() => handleDelete(review.id)}
              className="mt-3 text-xs text-red-600 hover:underline"
            >
              Delete review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
