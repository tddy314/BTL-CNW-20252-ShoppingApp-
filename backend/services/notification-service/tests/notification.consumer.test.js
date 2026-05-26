const test = require("node:test");
const assert = require("node:assert/strict");

const rabbitConfig = require("../src/config/rabbitmq/rabbitmq.config");
const { NotificationRepository } = require("../src/repository/notification.repo");

const originalGetRabbitChannel = rabbitConfig.getRabbitChannel;
const originalSaveNotification = NotificationRepository.prototype.saveNotification;
const consumerModulePath = require.resolve("../src/services/notification-consumer.service");

test.after(() => {
  rabbitConfig.getRabbitChannel = originalGetRabbitChannel;
  NotificationRepository.prototype.saveNotification = originalSaveNotification;
  delete require.cache[consumerModulePath];
});

test("message handling should save, emit and acknowledge a valid notification", async () => {
  let handleMessage;
  const acknowledged = [];
  const saved = [];
  const emitted = [];

  rabbitConfig.getRabbitChannel = async () => ({
    async consume(_queue, handler) {
      handleMessage = handler;
    },
    ack(message) {
      acknowledged.push(message);
    },
    nack() {
      assert.fail("valid messages should not be rejected");
    },
  });

  NotificationRepository.prototype.saveNotification = async (userId, notification) => {
    saved.push({ userId, notification });
  };

  delete require.cache[consumerModulePath];
  const { NotificationConsumerService } = require("../src/services/notification-consumer.service");
  const service = new NotificationConsumerService((...args) => emitted.push(args));

  await service.startConsumer();

  const message = {
    content: Buffer.from(JSON.stringify({
      toUserId: "buyer@example.com",
      type: "ORDER_CREATED",
      title: "New order",
      data: { channel: "buyer" },
    })),
  };
  await handleMessage(message);

  assert.equal(saved.length, 1);
  assert.equal(saved[0].userId, "buyer@example.com");
  assert.equal(saved[0].notification.type, "ORDER_CREATED");
  assert.deepEqual(emitted[0], [
    "buyer@example.com",
    "notification",
    saved[0].notification,
  ]);
  assert.deepEqual(acknowledged, [message]);
});
