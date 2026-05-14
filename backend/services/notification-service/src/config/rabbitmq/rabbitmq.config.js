const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const RABBITMQ_ENABLED = String(process.env.RABBITMQ_ENABLED || "true").toLowerCase() !== "false";
const NOTIFICATION_EXCHANGE = process.env.NOTIFICATION_EXCHANGE || "notifications";
const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "notification_service_queue";
const ROUTING_KEY = process.env.NOTIFICATION_ROUTING_KEY || "#";
const PREFETCH = Number(process.env.RABBITMQ_PREFETCH || 50);

let connection;
let channel;

async function getRabbitChannel() {
  if (!RABBITMQ_ENABLED) {
    throw new Error("RabbitMQ disabled via RABBITMQ_ENABLED=false");
  }

  if (channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(NOTIFICATION_EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
    await channel.bindQueue(NOTIFICATION_QUEUE, NOTIFICATION_EXCHANGE, ROUTING_KEY);
    await channel.prefetch(PREFETCH);
  } catch (error) {
    const reason = error?.message || error?.code || String(error);
    throw new Error(`RabbitMQ initialization failed (${RABBITMQ_URL}): ${reason}`);
  }

  connection.on("error", (error) => {
    console.error("RabbitMQ connection error:", error?.message || error);
  });

  connection.on("close", () => {
    console.error("RabbitMQ connection closed");
    connection = null;
    channel = null;
  });

  return channel;
}

module.exports = {
  getRabbitChannel,
  RABBITMQ_ENABLED,
  NOTIFICATION_EXCHANGE,
  NOTIFICATION_QUEUE,
};
