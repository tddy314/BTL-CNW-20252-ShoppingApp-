const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
// Tạo HTTP server từ ứng dụng Express
const server = http.createServer(app); 

// Khởi tạo Socket.io và cấu hình CORS (cho phép frontend gọi tới)
const io = new Server(server, {
    cors: {
        origin: "*", // Tạm thời cho phép tất cả các domain kết nối, sau này frontend chạy ở port nào thì điền vào đây
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- 1. XỬ LÝ KẾT NỐI REALTIME (SOCKET.IO) ---
io.on('connection', (socket) => {
    console.log(`🟢 Một user vừa kết nối với ID: ${socket.id}`);

    // Lắng nghe sự kiện người dùng tham gia vào "phòng riêng" của họ
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} đã tham gia phòng nhận thông báo.`);
    });

    // Khi người dùng ngắt kết nối (tắt web)
    socket.on('disconnect', () => {
        console.log(`🔴 User ${socket.id} đã ngắt kết nối`);
    });
});

// --- 2. XỬ LÝ API NHẬN TRIGGER TỪ CÁC SERVICE KHÁC ---
app.post('/api/notify', (req, res) => {
    const { userId, message, type } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ error: "Thiếu thông tin userId hoặc message" });
    }

    // Dùng Socket.io để bắn thông báo trực tiếp vào phòng của userId đó
    io.to(userId).emit('new_notification', {
        type: type || 'info',
        message: message,
        timestamp: new Date()
    });

    console.log(`Đã gửi thông báo tới user ${userId}: ${message}`);

    res.status(200).json({ success: true, message: "Đã gửi thông báo thành công" });
});

// --- 3. CHẠY SERVER ---
const PORT = 3004; // Đặt port khác với payment-service (3003)
server.listen(PORT, () => {
    console.log(`Notification Service đang chạy tại port ${PORT} 🚀`);
});