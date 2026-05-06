const express = require("express");
const { NotificationController } = require("../controllers/notification.controller");

const router = express.Router();
const controller = new NotificationController();

router.get("/health", controller.health.bind(controller));
router.post("/publish", controller.publishNotification.bind(controller));
router.get("/read-notifications", controller.getNotificationsByUser.bind(controller));

module.exports = { router };
