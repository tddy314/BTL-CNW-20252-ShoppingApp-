const { getRabbitChannel, NOTIFICATION_QUEUE, RABBITMQ_ENABLED } = require("../config/rabbitmq/rabbitmq.config");
const { NotificationRepository } = require("../repository/notification.repo");
const { normalizeIncomingNotification } = require("../controllers/notification.controller");

class NotificationConsumerService {
  constructor(emitToUser) {
    this.emitToUser = emitToUser;
    this.notificationRepo = new NotificationRepository();
    this.retryTimer = null;
  }

  async startConsumer() {
    const channel = await getRabbitChannel();
    await channel.consume(NOTIFICATION_QUEUE, async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload = JSON.parse(message.content.toString());
        const notification = normalizeIncomingNotification(payload);

        await this.notificationRepo.saveNotification(notification.toUserId, notification);
        this.emitToUser(notification.toUserId, "notification", notification);

        channel.ack(message);
      } catch (error) {
        console.error("Failed to consume notification:", error.message);
        channel.nack(message, false, false);
      }
    }, { noAck: false });

    console.log(`Notification consumer started on queue ${NOTIFICATION_QUEUE}`);
  }

  async start() {
    if (!RABBITMQ_ENABLED) {
      console.warn("RabbitMQ consumer disabled (RABBITMQ_ENABLED=false).");
      return;
    }

    try {
      await this.startConsumer();
    } catch (error) {
      console.error("Notification consumer unavailable:", error?.message || error);
      console.error("Will retry RabbitMQ connection every 5 seconds...");
      if (!this.retryTimer) {
        this.retryTimer = setInterval(async () => {
          try {
            await this.startConsumer();
            clearInterval(this.retryTimer);
            this.retryTimer = null;
          } catch (_err) {
            // Keep retrying silently; initial error is already logged.
          }
        }, 5000);
      }
    }
  }
}

module.exports = { NotificationConsumerService };
