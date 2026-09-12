import { Request, Response } from "express";
import { z } from "zod";
import { getGooglePlaceDetails, searchGooglePlaces, type GoogleReview } from "../lib/googlePlaces";
import { prisma } from "../lib/prisma";

function withAvgRating<T extends { reviews: { rating: number }[] }>(restaurant: T) {
  const { reviews, ...rest } = restaurant;
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  return { ...rest, avgRating, reviewCount: reviews.length };
}

export async function listRestaurants(req: Request, res: Response) {
  const { q, cuisine, city } = req.query as Record<string, string | undefined>;

  const restaurants = await prisma.restaurant.findMany({
    where: {
      AND: [
        q ? { name: { contains: q } } : {},
        cuisine ? { cuisine: { equals: cuisine } } : {},
        city ? { city: { equals: city } } : {},
      ],
    },
    include: { reviews: { select: { rating: true } } },
    orderBy: { createdAt: "desc" },
  });

  const local = restaurants.map((r) => ({ ...withAvgRating(r), source: "local" as const }));

  // Beyond Foodtok's own listings, let people search any real-world restaurant via
  // Google Places. The first time someone opens one of these it becomes a real,
  // reviewable Foodtok restaurant (see getRestaurant) — everything here is just a preview.
  let google: ReturnType<typeof mapGoogleSummary>[] = [];
  if (q && q.trim().length >= 2) {
    const alreadyMatched = new Set(restaurants.map((r) => r.googlePlaceId).filter(Boolean));
    const results = await searchGooglePlaces(q);
    google = results.filter((p) => !alreadyMatched.has(p.placeId)).map(mapGoogleSummary);
  }

  res.json({ restaurants: [...local, ...google] });
}

function mapGoogleSummary(place: Awaited<ReturnType<typeof searchGooglePlaces>>[number]) {
  return {
    id: `google:${place.placeId}`,
    name: place.name,
    description: null,
    cuisine: place.cuisine,
    address: place.address,
    city: place.address,
    lat: place.lat,
    lng: place.lng,
    priceRange: 2,
    coverImage: null,
    createdAt: new Date().toISOString(),
    avgRating: place.rating,
    reviewCount: place.reviewCount ?? 0,
    source: "google" as const,
  };
}

export async function getRestaurant(req: Request, res: Response) {
  let id = req.params.id;

  // A restaurant surfaced from Google search that no Foodtok user has opened yet.
  // Resolve it to a real, persistent restaurant row on first view.
  if (id.startsWith("google:")) {
    const placeId = id.slice("google:".length);
    const existing = await prisma.restaurant.findUnique({ where: { googlePlaceId: placeId } });
    if (existing) {
      id = existing.id;
    } else {
      const details = await getGooglePlaceDetails(placeId);
      if (!details) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      const created = await prisma.restaurant.create({
        data: {
          name: details.name,
          cuisine: details.cuisine,
          address: details.address,
          city: details.address,
          lat: details.lat,
          lng: details.lng,
          googlePlaceId: details.placeId,
          googleRating: details.rating,
          googleReviewCount: details.reviewCount,
        },
      });
      id = created.id;
    }
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const reviews = restaurant.reviews;
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  let googleReviews: GoogleReview[] = [];
  let googleMapsUrl: string | null = null;

  if (restaurant.googlePlaceId) {
    const details = await getGooglePlaceDetails(restaurant.googlePlaceId);
    if (details) {
      googleReviews = details.reviews;
      googleMapsUrl = details.mapsUrl;
      if (details.rating !== restaurant.googleRating || details.reviewCount !== restaurant.googleReviewCount) {
        await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: { googleRating: details.rating, googleReviewCount: details.reviewCount },
        });
      }
    }
  }

  res.json({
    restaurant: { ...restaurant, reviews, avgRating, reviewCount: reviews.length, googleReviews, googleMapsUrl },
  });
}

const createRestaurantSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  cuisine: z.string().min(1).max(60),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  priceRange: z.number().int().min(1).max(4).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export async function createRestaurant(req: Request, res: Response) {
  const parsed = createRestaurantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const restaurant = await prisma.restaurant.create({
    data: { ...parsed.data, coverImage: parsed.data.coverImage || null, createdById: req.user!.userId },
  });

  res.status(201).json({ restaurant });
}

export async function listCuisines(_req: Request, res: Response) {
  const rows = await prisma.restaurant.findMany({
    select: { cuisine: true },
    distinct: ["cuisine"],
    orderBy: { cuisine: "asc" },
  });
  res.json({ cuisines: rows.map((r) => r.cuisine) });
}
