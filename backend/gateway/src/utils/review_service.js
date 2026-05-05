import axios from "axios";

const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || "http://localhost:3005";

export class CallReview {
  async addReview(payload) {
    const res = await axios.post(`${REVIEW_SERVICE_URL}/review-service/add-review`, payload);
    return res.data;
  }

  async getReviewsByProduct(payload) {
    const res = await axios.post(`${REVIEW_SERVICE_URL}/review-service/get-reviews-by-product`, payload);
    return res.data;
  }

  async getProductRating(payload) {
    const res = await axios.post(`${REVIEW_SERVICE_URL}/review-service/get-product-rating`, payload);
    return res.data;
  }

  async getShopRating(payload) {
    const res = await axios.post(`${REVIEW_SERVICE_URL}/review-service/get-shop-rating`, payload);
    return res.data;
  }
}
