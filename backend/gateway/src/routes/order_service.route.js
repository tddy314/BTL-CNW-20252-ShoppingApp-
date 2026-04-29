import express from "express";
import { OrderGateWay } from "../gateways/order_service.gateway.js";

export const router = express.Router();
const orderGate = new OrderGateWay();

router.post("/new-order", orderGate.newOrder.bind(orderGate));
router.patch("/modify-order", orderGate.modifyOrder.bind(orderGate));
router.patch("/cancel-order", orderGate.cancelOrder.bind(orderGate));
router.patch("/seller-accept-order", orderGate.sellerAcceptOrder.bind(orderGate));
router.patch("/seller-reject-order", orderGate.sellerRejectOrder.bind(orderGate));
router.patch("/admin-ship-order", orderGate.adminShipOrder.bind(orderGate));
router.patch("/admin-deliver-order", orderGate.adminDeliverOrder.bind(orderGate));
router.post("/read-orders-by-buyer", orderGate.readOrdersByBuyer.bind(orderGate));
router.post("/read-orders-by-shop", orderGate.readOrdersByShop.bind(orderGate));
router.post("/read-all-orders", orderGate.readAllOrders.bind(orderGate));
