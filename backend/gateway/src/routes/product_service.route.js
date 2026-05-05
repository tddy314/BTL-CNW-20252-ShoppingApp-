import express from "express";
import { ProductGateWay } from "../gateways/product_service.gateway.js";

export const router = express.Router();
const productGate = new ProductGateWay();

router.post("/add-product", productGate.addProduct.bind(productGate));
router.patch("/update-product", productGate.updateProduct.bind(productGate));
router.post("/delete-product", productGate.deleteProduct.bind(productGate));
router.post("/get-product-by-id", productGate.getProductById.bind(productGate));
router.post("/search-products", productGate.searchProducts.bind(productGate));
