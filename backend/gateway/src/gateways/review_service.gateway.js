import { CallReview } from "../utils/review_service.js";

export class ReviewGateWay {
  review_service;

  constructor() {
    this.review_service = new CallReview();
  }

  buildErrorMessage(error) {
    return error?.response?.data?.message || error.message || "Unexpected review gateway error";
  }

  async addReview(req, res) {
    try {
      const result = await this.review_service.addReview(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async getReviewsByProduct(req, res) {
    try {
      const result = await this.review_service.getReviewsByProduct(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async getProductRating(req, res) {
    try {
      const result = await this.review_service.getProductRating(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async getShopRating(req, res) {
    try {
      const result = await this.review_service.getShopRating(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }
}
