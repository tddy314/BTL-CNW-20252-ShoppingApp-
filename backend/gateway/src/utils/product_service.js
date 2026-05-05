import axios from "axios";

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3004";

export class CallProduct {
  async addProduct(payload) {
    const res = await axios.post(`${PRODUCT_SERVICE_URL}/product-service/add-product`, payload);
    return res.data;
  }

  async updateProduct(payload) {
    const res = await axios.patch(`${PRODUCT_SERVICE_URL}/product-service/update-product`, payload);
    return res.data;
  }

  async deleteProduct(payload) {
    const res = await axios.post(`${PRODUCT_SERVICE_URL}/product-service/delete-product`, payload);
    return res.data;
  }

  async getProductById(payload) {
    const res = await axios.post(`${PRODUCT_SERVICE_URL}/product-service/get-product-by-id`, payload);
    return res.data;
  }

  async searchProducts(payload) {
    const res = await axios.post(`${PRODUCT_SERVICE_URL}/product-service/search-products`, payload);
    return res.data;
  }
}
