import { CallProduct } from "../utils/product_service.js";

export class ProductGateWay {
  product_service;

  constructor() {
    this.product_service = new CallProduct();
  }

  buildErrorMessage(error) {
    return error?.response?.data?.message || error.message || "Unexpected product gateway error";
  }

  async addProduct(req, res) {
    try {
      const result = await this.product_service.addProduct(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async updateProduct(req, res) {
    try {
      const result = await this.product_service.updateProduct(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async deleteProduct(req, res) {
    try {
      const result = await this.product_service.deleteProduct(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async getProductById(req, res) {
    try {
      const result = await this.product_service.getProductById(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }

  async searchProducts(req, res) {
    try {
      const result = await this.product_service.searchProducts(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
    }
  }
}
