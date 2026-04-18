require('dotenv').config();
const express = require('express');
const http = require('http');
const redisClient = require('./redisClient');
const { createSocketServer } = require('./socket');
const { startConsumer } = require('./rabbit');

const PORT = process.env.PORT || 4000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function main() {
  const app = express();
  const server = http.createServer(app);

  const { io, emitToUser } = createSocketServer(server, redisClient);

  // Basic HTTP route for health
  app.get('/health', (req, res) => res.json({ ok: true }));

  // Start RabbitMQ consumer
  await startConsumer(RABBITMQ_URL, async (message) => {
    // message expected: { toUserId, type, title, body, data, id, createdAt }
    try {
      const toUserId = String(message.toUserId || message.userId || message.to);
      const key = `notifications:${toUserId}`;
      const payload = {
        id: message.id || `n_${Date.now()}`,
        type: message.type || 'UNKNOWN',
        title: message.title || '',
        body: message.body || '',
        data: message.data || {},
        createdAt: message.createdAt || Date.now()
      };

      // store in Redis list (LPUSH) and keep max 100
      await redisClient.lpush(key, JSON.stringify(payload));
      await redisClient.ltrim(key, 0, 99);

      // try to emit realtime to connected sockets
      const sent = await emitToUser(toUserId, 'notification', payload);
      console.log('Delivered to user?', toUserId, sent);
    } catch (err) {
      console.error('Error handling notification message', err);
    }
  });

  server.listen(PORT, () => {
    console.log(`Notification service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Service failed to start', err);
  process.exit(1);
});
