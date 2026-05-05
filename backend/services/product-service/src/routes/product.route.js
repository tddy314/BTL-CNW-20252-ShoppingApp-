import express from "express";
import { ProductController } from "../controllers/product.controller.js";

export const router = express.Router();
const controller = new ProductController();

router.post("/add-product", controller.addProduct.bind(controller));
router.patch("/update-product", controller.updateProduct.bind(controller));
router.post("/delete-product", controller.deleteProduct.bind(controller));
router.post("/get-product-by-id", controller.getProductById.bind(controller));
router.post("/search-products", controller.searchProducts.bind(controller));
