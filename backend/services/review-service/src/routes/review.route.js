import express from "express";
import { ReviewController } from "../controllers/review.controller.js";

export const router = express.Router();
const controller = new ReviewController();

router.post("/add-review", controller.addReview.bind(controller));
router.post("/get-reviews-by-product", controller.getReviewsByProduct.bind(controller));
router.post("/get-product-rating", controller.getProductRating.bind(controller));
router.post("/get-shop-rating", controller.getShopRating.bind(controller));
