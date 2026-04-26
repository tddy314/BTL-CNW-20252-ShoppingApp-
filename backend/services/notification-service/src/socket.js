const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');

function createSocketServer(httpServer, redisClient) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.use(async (socket, next) => {
    const token = socket.handshake.query && socket.handshake.query.token;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.data.user = payload;
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.data.user;
    if (user && user.id) {
      const key = `user_sockets:${user.id}`;
      await redisClient.sadd(key, socket.id);
      socket.join(`user:${user.id}`);
    }

    socket.on('disconnect', async () => {
      const user = socket.data.user;
      if (user && user.id) {
        const key = `user_sockets:${user.id}`;
        await redisClient.srem(key, socket.id);
      }
    });
  });

  async function emitToUser(userId, event, payload) {
    const key = `user_sockets:${userId}`;
    const socketIds = await redisClient.smembers(key);
    if (!socketIds || socketIds.length === 0) return false;
    socketIds.forEach((sid) => {
      io.to(sid).emit(event, payload);
    });
    return true;
  }

  return { io, emitToUser };
}

module.exports = { createSocketServer };
