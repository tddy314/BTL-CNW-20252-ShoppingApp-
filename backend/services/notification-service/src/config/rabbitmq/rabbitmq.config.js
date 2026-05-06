const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const NOTIFICATION_EXCHANGE = process.env.NOTIFICATION_EXCHANGE || "notifications";
const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "notification_service_queue";
const ROUTING_KEY = process.env.NOTIFICATION_ROUTING_KEY || "#";
const PREFETCH = Number(process.env.RABBITMQ_PREFETCH || 50);

let connection;
let channel;

async function getRabbitChannel() {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertExchange(NOTIFICATION_EXCHANGE, "topic", { durable: true });
  await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
  await channel.bindQueue(NOTIFICATION_QUEUE, NOTIFICATION_EXCHANGE, ROUTING_KEY);
  await channel.prefetch(PREFETCH);

  connection.on("error", (error) => {
    console.error("RabbitMQ connection error:", error.message);
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
  NOTIFICATION_EXCHANGE,
  NOTIFICATION_QUEUE,
};
