import express from "express";
import { ShopController } from "../controllers/shop.controller.js";

export const router = express.Router();
const controller = new ShopController();

router.post("/create-shop", controller.createShop.bind(controller));
router.post("/delete-shop", controller.deleteShop.bind(controller));
router.patch("/update-shop-bank-info", controller.updateShopBankInfo.bind(controller));
router.post("/get-shops-by-owner", controller.getShopsByOwner.bind(controller));
router.post("/get-shop-by-id", controller.getShopById.bind(controller));
