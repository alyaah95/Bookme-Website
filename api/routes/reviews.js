import express from "express";
import {createReview, getHotelReviews, getUserReviews} from "../controllers/review.js";
import { verifyToken } from "../utils/verifyToken.js";
const router = express.Router();



// Reviews
router.post("/:id/reviews", verifyToken, createReview);
router.get("/:id/reviews", getHotelReviews);
router.get("/user/:userId/reviews", getUserReviews);

export default router;