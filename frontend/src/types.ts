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
  createdById: string;
  createdAt: string;
  avgRating: number | null;
  reviewCount: number;
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
  createdBy: { id: string; name: string };
}

export interface MyReview extends Review {
  restaurant: { id: string; name: string; city: string; coverImage: string | null };
}
