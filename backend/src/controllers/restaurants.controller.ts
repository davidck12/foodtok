import { Request, Response } from "express";
import { z } from "zod";
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

  res.json({ restaurants: restaurants.map(withAvgRating) });
}

export async function getRestaurant(req: Request, res: Response) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
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

  res.json({ restaurant: { ...restaurant, reviews, avgRating, reviewCount: reviews.length } });
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
