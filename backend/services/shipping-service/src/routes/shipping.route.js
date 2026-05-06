const express = require("express");
const { ShippingController } = require("../controllers/shipping.controller");

const router = express.Router();
const controller = new ShippingController();

router.get("/health", controller.health.bind(controller));
router.post("/create-shipment", controller.createShipment.bind(controller));
router.get("/get-shipment/:shipmentId", controller.getShipmentById.bind(controller));
router.get("/track-shipment", controller.getShipmentByTrackingNumber.bind(controller));
router.patch("/update-shipment-status/:shipmentId", controller.updateShipmentStatus.bind(controller));
router.get("/list-shipments", controller.listShipments.bind(controller));
router.get("/stats", controller.stats.bind(controller));

module.exports = { router };
