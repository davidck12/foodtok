import { Router } from "express";
import { deleteReview, myReviews } from "../controllers/reviews.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/mine", requireAuth, myReviews);
router.delete("/:id", requireAuth, deleteReview);

export default router;
