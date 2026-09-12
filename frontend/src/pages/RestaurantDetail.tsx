import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, uploadImage } from "../api/client";
import { RestaurantMap } from "../components/RestaurantMap";
import { StarRating } from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { priceSymbol } from "../lib/price";
import type { RestaurantDetail as RestaurantDetailType } from "../types";

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return <img src={photoUrl} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="h-7 w-2/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      </div>
    );
  }
  if (!restaurant) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium text-neutral-700">Restaurant not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">{restaurant.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-neutral-500">
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700">
              {restaurant.cuisine}
            </span>
            <span>
              {restaurant.address}, {restaurant.city}
            </span>
            {restaurant.priceRange > 0 && (
              <span className="font-medium text-neutral-600">
                · {priceSymbol(restaurant.priceRange)} (~${restaurant.priceRange}/person)
              </span>
            )}
          </p>
          {restaurant.description && <p className="mt-4 leading-relaxed text-neutral-700">{restaurant.description}</p>}
          <div className="mt-5 flex items-center gap-2">
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
        <div className="h-64 overflow-hidden rounded-2xl border border-neutral-200 shadow-sm md:h-full">
          <RestaurantMap
            restaurants={[restaurant]}
            center={[restaurant.lat, restaurant.lng]}
            zoom={15}
            interactiveMarkers={false}
          />
        </div>
      </div>

      {user && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
          <h2 className="font-display mb-3 font-semibold text-neutral-900">Leave a review</h2>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            required
            placeholder="What did you eat? Would you recommend it?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="mt-3 flex items-center justify-between">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="text-sm text-neutral-500 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post review"}
            </button>
          </div>
        </form>
      )}
      {!user && (
        <p className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 shadow-card">
          <a href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </a>{" "}
          to leave a review.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {restaurant.reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Avatar name={review.user.name} photoUrl={review.user.avatarUrl} />
              <div className="flex-1">
                <p className="font-medium text-neutral-900">{review.user.name}</p>
                <p className="text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <StarRating value={review.rating} size="sm" />
            </div>
            <p className="mt-3 leading-relaxed text-sm text-neutral-700">{review.text}</p>
            {review.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {review.photos.map((p) => (
                  <img key={p} src={p} alt="Review" className="h-24 w-24 rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {restaurant.googleReviews.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display flex items-center gap-2 font-semibold text-neutral-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold shadow-card">
                <span className="bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  G
                </span>
              </span>
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
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                View on Google Maps →
              </a>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {restaurant.googleReviews.map((review, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <Avatar name={review.authorName} photoUrl={review.authorPhotoUrl} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{review.authorName}</p>
                    <p className="text-xs text-neutral-400">{review.relativeTime}</p>
                  </div>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.text && <p className="mt-3 leading-relaxed text-sm text-neutral-700">{review.text}</p>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-400">Reviews provided by Google.</p>
        </div>
      )}
    </div>
  );
}
