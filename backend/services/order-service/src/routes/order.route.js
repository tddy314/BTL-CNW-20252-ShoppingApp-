import express from "express";
import { OrderController } from "../controllers/order.controller.js";

export const router = express.Router();
const controller = new OrderController();

router.post("/new-order", controller.newOrder.bind(controller));
router.patch("/modify-order", controller.modifyOrder.bind(controller));
router.patch("/cancel-order", controller.cancelOrder.bind(controller));
router.patch("/seller-accept-order", controller.sellerAcceptOrder.bind(controller));
router.patch("/seller-reject-order", controller.sellerRejectOrder.bind(controller));
router.patch("/admin-ship-order", controller.adminShipOrder.bind(controller));
router.patch("/admin-deliver-order", controller.adminDeliverOrder.bind(controller));
router.post("/read-orders-by-buyer", controller.readOrdersByBuyer.bind(controller));
router.post("/read-orders-by-shop", controller.readOrdersByShop.bind(controller));
router.post("/read-all-orders", controller.readAllOrders.bind(controller));
