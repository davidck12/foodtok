import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
  photos: z.array(z.string().url()).max(6).optional(),
});

export async function createReview(req: Request, res: Response) {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.restaurantId } });
  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const existing = await prisma.review.findUnique({
    where: {
      restaurantId_userId: { restaurantId: restaurant.id, userId: req.user!.userId },
    },
  });
  if (existing) {
    return res.status(409).json({ error: "You've already reviewed this restaurant" });
  }

  const review = await prisma.review.create({
    data: {
      rating: parsed.data.rating,
      text: parsed.data.text,
      photos: JSON.stringify(parsed.data.photos ?? []),
      restaurantId: restaurant.id,
      userId: req.user!.userId,
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  res.status(201).json({ review: { ...review, photos: JSON.parse(review.photos) } });
}

export async function deleteReview(req: Request, res: Response) {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }
  if (review.userId !== req.user!.userId) {
    return res.status(403).json({ error: "You can only delete your own reviews" });
  }
  await prisma.review.delete({ where: { id: review.id } });
  res.status(204).send();
}

export async function myReviews(req: Request, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { userId: req.user!.userId },
    include: { restaurant: { select: { id: true, name: true, city: true, coverImage: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ reviews: reviews.map((r) => ({ ...r, photos: JSON.parse(r.photos) })) });
}
