import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, uploadImage } from "../api/client";
import { RestaurantMap } from "../components/RestaurantMap";
import { StarRating } from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import type { RestaurantDetail as RestaurantDetailType } from "../types";

const PRICE_LABELS = ["", "$", "$$", "$$$", "$$$$"];

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => (await api.get<{ restaurant: RestaurantDetailType }>(`/restaurants/${id}`)).data.restaurant,
  });

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const alreadyReviewed = restaurant?.reviews.some((r) => r.userId === user?.id);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    setSubmitting(true);
    try {
      let photos: string[] = [];
      if (photoFile) {
        photos = [await uploadImage(photoFile)];
      }
      // Use the resolved restaurant id, not the URL param — a restaurant opened for
      // the first time via a Google search result only gets a real id once fetched.
      await api.post(`/restaurants/${restaurant.id}/reviews`, { rating, text, photos });
      setText("");
      setPhotoFile(null);
      queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Review posted!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not post review");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <p className="mx-auto max-w-4xl px-4 py-8 text-neutral-500">Loading…</p>;
  if (!restaurant) return <p className="mx-auto max-w-4xl px-4 py-8 text-neutral-500">Restaurant not found.</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{restaurant.name}</h1>
          <p className="mt-1 text-neutral-500">
            {restaurant.cuisine} · {restaurant.address}, {restaurant.city} · {PRICE_LABELS[restaurant.priceRange]}
          </p>
          {restaurant.description && <p className="mt-3 text-neutral-700">{restaurant.description}</p>}
          <div className="mt-4 flex items-center gap-2">
            {restaurant.avgRating ? (
              <>
                <StarRating value={restaurant.avgRating} />
                <span className="text-sm text-neutral-500">
                  {restaurant.avgRating.toFixed(1)} ({restaurant.reviewCount} review
                  {restaurant.reviewCount === 1 ? "" : "s"})
                </span>
              </>
            ) : (
              <span className="text-sm text-neutral-400">Be the first to review this place</span>
            )}
          </div>
        </div>
        <div className="h-64 overflow-hidden rounded-xl border border-neutral-200 md:h-full">
          <RestaurantMap
            restaurants={[restaurant]}
            center={[restaurant.lat, restaurant.lng]}
            zoom={15}
            interactiveMarkers={false}
          />
        </div>
      </div>

      {user && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Leave a review</h2>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            required
            placeholder="What did you eat? Would you recommend it?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="mt-3 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </form>
      )}
      {!user && (
        <p className="mb-8 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
          <a href="/login" className="text-brand-600 hover:underline">Log in</a> to leave a review.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {restaurant.reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-900">{review.user.name}</span>
              <StarRating value={review.rating} size="sm" />
            </div>
            <p className="mt-2 text-sm text-neutral-700">{review.text}</p>
            {review.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {review.photos.map((p) => (
                  <img key={p} src={p} alt="Review" className="h-24 w-24 rounded-md object-cover" />
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {restaurant.googleReviews.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
              Google Reviews
              {restaurant.googleRating != null && (
                <span className="flex items-center gap-1 text-sm font-normal text-neutral-500">
                  <StarRating value={restaurant.googleRating} size="sm" />
                  {restaurant.googleRating.toFixed(1)} ({restaurant.googleReviewCount})
                </span>
              )}
            </h2>
            {restaurant.googleMapsUrl && (
              <a
                href={restaurant.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-brand-600 hover:underline"
              >
                View on Google Maps
              </a>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {restaurant.googleReviews.map((review, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  {review.authorPhotoUrl && (
                    <img src={review.authorPhotoUrl} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                  )}
                  <span className="font-medium text-neutral-900">{review.authorName}</span>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.text && <p className="mt-2 text-sm text-neutral-700">{review.text}</p>}
                <p className="mt-2 text-xs text-neutral-400">{review.relativeTime}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-400">Reviews provided by Google.</p>
        </div>
      )}
    </div>
  );
}
