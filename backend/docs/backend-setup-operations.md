# Backend Setup, Config and Operations Guide

## 1. Mục tiêu
Tài liệu này tập trung vào:
- Thiết lập môi trường local cho backend
- Quy ước biến môi trường
- Quy trình vận hành và debug
- Checklist trước khi commit / trước khi demo

---

## 2. Chuẩn bị môi trường
### 2.1 Công cụ cần cài
- Node.js 18+
- npm
- Redis (local hoặc cloud)
- RabbitMQ (local hoặc cloud)
- Tài khoản Supabase

### 2.2 Cấu trúc monorepo backend
- Root backend có script chạy đồng thời nhiều service
- Mỗi service tự quản `.env` và dependency riêng

---

## 3. Quy trình setup local đề xuất
1. Clone repo
2. Tạo `.env` cho từng service cần chạy
3. Cài package:
   - `cd backend && npm install`
   - service nào chạy riêng thì vào service đó `npm install` nếu cần
4. Khởi động Redis + RabbitMQ
5. Chạy backend:
   - `cd backend`
   - `npm run dev`
6. Chạy frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

---

## 4. Mẫu biến môi trường quan trọng

## 4.1 notification-service
Ví dụ:
```env
PORT=4000
RABBITMQ_URL=amqp://guest:guest@localhost:5672
FRONTEND_URL=http://localhost:8000
API_GATEWAY_URL=http://localhost:8080

REDIS_ENDPOINT=redis-xxxxx.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=15683
REDIS_USERNAME=default
REDIS_PASSWORD=your_password

NOTIFICATION_EXCHANGE=notifications
NOTIFICATION_QUEUE=notification_service_queue
NOTIFICATION_ROUTING_KEY=#
RABBITMQ_PREFETCH=50
NOTIFICATION_MAX_ITEMS=50
JWT_SECRET=jwt_secret
```

## 4.2 order-service
Ví dụ:
```env
NOTIFICATION_SERVICE_URL=http://localhost:4000/notification-service
ADMIN_USER_IDS=admin1@example.com,admin2@example.com
```

## 4.3 frontend
Ví dụ:
```env
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost:4000
API_GATEWAY_URL=http://localhost:8080
```

---

## 5. Health check đề xuất
Sau khi chạy service, kiểm tra nhanh:
- Gateway: endpoint bất kỳ `/api-gate/...`
- Notification: `GET http://localhost:4000/notification-service/health`
- Payment mock: `GET http://localhost:5000/health`
- Shipping mock: `GET http://localhost:3006/shipping-service/health`

---

## 6. Luồng kiểm thử nghiệp vụ quan trọng

### 6.1 Luồng order + notification
1. User tạo order
2. Seller nhận order và accept
3. Admin thấy notification tab admin
4. Admin ship -> buyer nhận notification shipped
5. Admin deliver -> buyer nhận notification delivered
6. Buyer cancel (trạng thái cho phép) -> seller + admin nhận notification

### 6.2 Luồng product detail
1. Chọn thuộc tính sản phẩm (color/size/material/quantity)
2. Click Buy Now -> chuyển tới confirm-order kèm dữ liệu đã chọn
3. Click Share Product -> copy link sản phẩm vào clipboard

### 6.3 Luồng navigation trang chủ
1. Click Start Shopping -> `/products`
2. Click Sell on ShopHub -> `/my-shops`

---

## 7. Chiến lược logging
### 7.1 Mức log tối thiểu nên có
- Incoming request (route + actor)
- Business state transitions
- External calls (RabbitMQ/Redis/Supabase)
- Error context (không log secret)

### 7.2 Gợi ý format log
```text
[timestamp] [service] [level] message key=value ...
```

Ví dụ:
```text
2026-05-06T10:00:00Z order-service INFO order_status_changed order_id=... from=pending to=processing
```

---

## 8. Các lỗi thường gặp và cách xử lý

### 8.1 Redis TLS mismatch
Triệu chứng:
- `ssl3_get_record:wrong version number`

Cách xử lý:
- Đồng bộ cấu hình TLS với endpoint thực tế
- Với code hiện tại dùng `redis` client theo host/port/user/password

### 8.2 Notification không hiện tab admin
Nguyên nhân thường gặp:
- Không có `ADMIN_USER_IDS`
- Hoặc admin metadata chưa đúng `role=admin`
- order-service chưa restart sau khi đổi env

### 8.3 Frontend vẫn giữ login quá lâu
Nguyên nhân:
- Chưa validate token exp

Trạng thái hiện tại:
- Đã implement auto logout khi token hết hạn trong auth context

---

## 9. Checklist trước khi commit
1. Chạy syntax check cho file JS mới/sửa
2. Xác nhận env quan trọng đã ghi tài liệu
3. Xác nhận endpoint mới có README tương ứng
4. Không để lộ secret vào docs public (nếu repo public)
5. Kiểm tra không có code dead hoặc import thừa ở file mới

---

## 10. Checklist trước khi demo
1. Khởi động RabbitMQ/Redis trước backend
2. Khởi động notification-service trước order actions
3. Login bằng đủ role: buyer/seller/admin
4. Tạo ít nhất 2-3 order để test paging notification
5. Test cả đường đi cũ (cart -> confirm-order) và đường đi mới (buy-now)

---

## 11. Tài liệu liên quan
- `backend/docs/backend-architecture.md`
- `backend/docs/backend-api-reference.md`
- `backend/services/notification-service/README.md`
- `backend/services/payment-service/README.md`
- `backend/services/shipping-service/README.md`

---

## 12. Kết luận
Bộ backend hiện có thể phục vụ tốt cho mục tiêu đồ án: rõ domain, dễ mở rộng, có event flow notification, có mock payment/shipping đầy đủ để demo nghiệp vụ và commit milestone.
