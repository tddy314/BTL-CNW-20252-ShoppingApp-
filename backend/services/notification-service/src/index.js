require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { router: notificationRouter } = require("./routes/notification.route");
const { createSocketServer } = require("./socket/socket.server");
const { NotificationConsumerService } = require("./services/notification-consumer.service");
const { connectRedis } = require("./config/database/redis.config");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/notification-service", notificationRouter);

async function bootstrap() {
  await connectRedis();
  const { emitToUser } = createSocketServer(server);

  const consumerService = new NotificationConsumerService(emitToUser);
  await consumerService.start();

  server.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/notification-service`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start notification service:", error?.message || error);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
