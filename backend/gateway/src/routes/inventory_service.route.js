import express from "express";
import { InventoryGateWay } from "../gateways/inventory_service.gateway.js";

export const router = express.Router();
const inventoryGate = new InventoryGateWay();

router.post("/create-shop", inventoryGate.createShop.bind(inventoryGate));
router.post("/delete-shop", inventoryGate.deleteShop.bind(inventoryGate));
router.patch("/update-shop-bank-info", inventoryGate.updateShopBankInfo.bind(inventoryGate));
router.patch("/update-shop-info", inventoryGate.updateShopInfo.bind(inventoryGate));
router.post("/get-shops-by-owner", inventoryGate.getShopsByOwner.bind(inventoryGate));
router.post("/get-shop-by-id", inventoryGate.getShopById.bind(inventoryGate));
router.post("/create-profile", inventoryGate.createProfile.bind(inventoryGate));
router.post("/get-profile", inventoryGate.getProfile.bind(inventoryGate));
router.patch("/update-profile", inventoryGate.updateProfile.bind(inventoryGate));