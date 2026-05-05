import { ProductRepository } from "../repository/product.repo.js";

export class ProductController {
  productRepo;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async addProduct(req, res) {
    try {
      const result = await this.productRepo.addProduct(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const result = await this.productRepo.updateProduct(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const result = await this.productRepo.deleteProduct(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async getProductById(req, res) {
    try {
      const result = await this.productRepo.getProductById(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async searchProducts(req, res) {
    try {
      const result = await this.productRepo.searchProducts(req.body);
      res.status(200).json({ message: "OK", result });
    } catch (error) {
      res.status(400).json({ message: "Error: " + error.message });
    }
  }
}
