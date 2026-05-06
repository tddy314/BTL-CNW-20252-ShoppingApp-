const { getRabbitChannel, NOTIFICATION_QUEUE } = require("../config/rabbitmq/rabbitmq.config");
const { NotificationRepository } = require("../repository/notification.repo");
const { normalizeIncomingNotification } = require("../controllers/notification.controller");

class NotificationConsumerService {
  constructor(emitToUser) {
    this.emitToUser = emitToUser;
    this.notificationRepo = new NotificationRepository();
  }

  async start() {
    const channel = await getRabbitChannel();

    await channel.consume(
      NOTIFICATION_QUEUE,
      async (message) => {
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
      },
      { noAck: false }
    );

    console.log(`Notification consumer started on queue ${NOTIFICATION_QUEUE}`);
  }
}

module.exports = { NotificationConsumerService };
