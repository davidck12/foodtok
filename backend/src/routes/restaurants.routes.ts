import { Router } from "express";
import {
  createRestaurant,
  getRestaurant,
  listCuisines,
  listRestaurants,
} from "../controllers/restaurants.controller";
import { createReview } from "../controllers/reviews.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", listRestaurants);
router.get("/cuisines", listCuisines);
router.get("/:id", getRestaurant);
router.post("/", requireAuth, createRestaurant);
router.post("/:restaurantId/reviews", requireAuth, createReview);

export default router;
