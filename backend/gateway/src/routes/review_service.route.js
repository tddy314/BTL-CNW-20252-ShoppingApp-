import express from "express";
import { ReviewGateWay } from "../gateways/review_service.gateway.js";

export const router = express.Router();
const reviewGate = new ReviewGateWay();

router.post("/add-review", reviewGate.addReview.bind(reviewGate));
router.post("/get-reviews-by-product", reviewGate.getReviewsByProduct.bind(reviewGate));
router.post("/get-product-rating", reviewGate.getProductRating.bind(reviewGate));
router.post("/get-shop-rating", reviewGate.getShopRating.bind(reviewGate));
