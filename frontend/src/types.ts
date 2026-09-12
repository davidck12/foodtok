export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisine: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  priceRange: number;
  coverImage: string | null;
  createdById?: string | null;
  createdAt: string;
  avgRating: number | null;
  reviewCount: number;
  /** "google" means this card is a live Google Places preview not yet saved as a Foodtok restaurant. */
  source: "local" | "google";
}

export interface RestaurantSuggestion {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  lat: number;
  lng: number;
  source: "local" | "google";
}

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  photos: string[];
  restaurantId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface RestaurantDetail extends Restaurant {
  reviews: Review[];
  createdBy: { id: string; name: string } | null;
  googleReviews: GoogleReview[];
  googleMapsUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
}

export interface MyReview extends Review {
  restaurant: { id: string; name: string; city: string; coverImage: string | null };
}
