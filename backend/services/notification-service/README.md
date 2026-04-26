# Notification Service

Đây là service độc lập xử lý thông báo realtime bằng RabbitMQ, Redis và Socket.IO.

Quick start:

1. Tạo file `.env` dựa trên `.env.example`.
2. Cài dependencies: `npm install` trong `backend/services/notification-service`.
3. Chạy service: `npm start`.
4. Gửi test message: `npm run demo`.

Design:
- RabbitMQ exchange `notifications` (type `topic`) để các service khác publish sự kiện.
- Notification-service subscribe tất cả routing key (`#`), lưu thông báo vào Redis list `notifications:<userId>` và emit realtime qua Socket.IO.
- Socket.IO sử dụng `socket.io-redis` adapter để scale across instances.