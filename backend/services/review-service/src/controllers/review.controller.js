import { ReviewRepository } from "../repository/review.repo.js";

export class ReviewController {
  reviewRepo;

  constructor() {
    this.reviewRepo = new ReviewRepository();
  }

  async addReview(req, res) {
    try {
      const result = await this.reviewRepo.addReview(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async getReviewsByProduct(req, res) {
    try {
      const result = await this.reviewRepo.getReviewsByProduct(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async getProductRating(req, res) {
    try {
      const result = await this.reviewRepo.getProductRating(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async getShopRating(req, res) {
    try {
      const result = await this.reviewRepo.getShopRating(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }
}
