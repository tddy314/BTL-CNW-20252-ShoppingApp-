const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:8000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      socket.data.user = decoded;
      return next();
    } catch (_error) {
      return next();
    }
  });

  io.on("connection", (socket) => {
    const userId = String(
      socket.data.user?.id || socket.data.user?.userId || socket.handshake.query?.userId || ""
    ).trim();

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("join_room", (roomOrUserId) => {
      const room = String(roomOrUserId || "").trim();
      if (room) {
        socket.join(room.startsWith("user:") ? room : `user:${room}`);
      }
    });
  });

  function emitToUser(userId, eventName, payload) {
    const room = `user:${userId}`;
    io.to(room).emit(eventName, payload);
  }

  return { io, emitToUser };
}

module.exports = { createSocketServer };
