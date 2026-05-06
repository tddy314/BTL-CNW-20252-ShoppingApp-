const { NotificationRepository } = require("../repository/notification.repo");
const { getRabbitChannel, NOTIFICATION_EXCHANGE } = require("../config/rabbitmq/rabbitmq.config");

function normalizeIncomingNotification(payload) {
  const toUserId = String(payload.toUserId || payload.userId || payload.to || "").trim();
  if (!toUserId) {
    throw new Error("Missing toUserId");
  }

  return {
    toUserId,
    id: payload.id || `n_${Date.now()}`,
    type: payload.type || "INFO",
    title: payload.title || "",
    body: payload.body || "",
    data: payload.data || {},
    createdAt: payload.createdAt || Date.now(),
  };
}

class NotificationController {
  constructor() {
    this.notificationRepo = new NotificationRepository();
  }

  async health(_req, res) {
    return res.status(200).json({ ok: true });
  }

  async publishNotification(req, res) {
    try {
      const notification = normalizeIncomingNotification(req.body || {});
      const channel = await getRabbitChannel();
      const routingKey = req.body?.routingKey || "notification.created";

      channel.publish(
        NOTIFICATION_EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(notification)),
        { persistent: true }
      );

      return res.status(200).json({
        message: "Notification queued",
        result: notification,
      });
    } catch (error) {
      return res.status(400).json({ message: "Error: " + error.message });
    }
  }

  async getNotificationsByUser(req, res) {
    try {
      const userId = String(req.query.userId || req.body?.userId || "").trim();
      const channel = String(req.query.channel || req.body?.channel || "").trim();
      const page = Number(req.query.page || req.body?.page || 1);
      const limit = Number(req.query.limit || req.body?.limit || 10);

      if (!userId) {
        throw new Error("userId is required");
      }

      const result = await this.notificationRepo.getNotificationsByUserPaginated({
        userId,
        channel: channel || undefined,
        page,
        limit,
      });
      return res.status(200).json({ message: "OK", result });
    } catch (error) {
      return res.status(400).json({ message: "Error: " + error.message });
    }
  }
}

module.exports = {
  NotificationController,
  normalizeIncomingNotification,
};
