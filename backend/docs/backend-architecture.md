# Backend Architecture Documentation

## 1. Mục tiêu tài liệu
Tài liệu này mô tả kiến trúc backend của hệ thống Shopping App theo hướng microservices. Mục tiêu là giúp thành viên mới hiểu nhanh cấu trúc dự án, đường đi request, trách nhiệm của từng service, cách mở rộng hệ thống, và các nguyên tắc vận hành cơ bản.

---

## 2. Tổng quan kiến trúc
Backend hiện tại bao gồm:
- API Gateway (điểm vào chung cho frontend)
- Nhóm service nghiệp vụ độc lập
- Cơ chế lưu trữ phân tán theo chức năng
- Event-driven cho notification thông qua RabbitMQ

### 2.1 Thành phần chính
1. `gateway`
- Tiếp nhận request từ frontend qua prefix `/api-gate/...`
- Thực hiện định tuyến tới service tương ứng
- Đóng vai trò lớp giao tiếp tập trung

2. Nhóm service nghiệp vụ
- `auth-service`
- `product-service`
- `inventory-service`
- `cart-service`
- `order-service`
- `review-service`
- `notification-service`
- `payment-service` (mock)
- `shipping-service` (mock chuẩn cấu trúc)

3. Dữ liệu
- Supabase: dữ liệu chính (người dùng, shop, sản phẩm, đơn hàng, đánh giá)
- Redis: giỏ hàng, notification gần nhất
- RabbitMQ: hàng đợi sự kiện notification

---

## 3. Tổ chức source code
Mỗi service nên theo cấu trúc chuẩn:
- `src/index.js`: bootstrap service
- `src/routes/*`: định nghĩa route
- `src/controllers/*`: xử lý request/response
- `src/repository/*`: business logic + database access
- `src/config/*`: kết nối hạ tầng (db, mq, redis)

Notification-service và shipping-service đã được triển khai theo cấu trúc này.

---

## 4. Trách nhiệm từng service

### 4.1 auth-service
- Đăng ký, đăng nhập user
- Trả access token cho frontend
- Đồng bộ profile cơ bản khi sign up

### 4.2 product-service
- CRUD sản phẩm
- Tìm kiếm sản phẩm theo query/category/shop
- Ánh xạ metadata shop vào danh sách sản phẩm

### 4.3 inventory-service
- Quản lý shop
- Quản lý profile người dùng
- Cập nhật thông tin shop và ngân hàng nhận thanh toán

### 4.4 cart-service
- Lưu giỏ hàng theo user trong Redis
- Hỗ trợ thêm/xóa/đọc giỏ hàng
- Có phân trang mức ứng dụng

### 4.5 order-service
- Tạo đơn hàng
- Cho phép buyer sửa/hủy ở trạng thái cho phép
- Seller accept/reject
- Admin ship/deliver
- Khi trạng thái đơn đổi, phát notification tới các role liên quan

### 4.6 review-service
- Tạo review sản phẩm
- Đọc review theo sản phẩm
- Tính rating trung bình sản phẩm/shop

### 4.7 notification-service
- Nhận request publish notification
- Đẩy message vào RabbitMQ exchange
- Consumer đọc queue, lưu Redis, phát realtime qua Socket.IO
- API đọc notification theo user + channel + phân trang
- Cơ chế retention: giữ tối đa N notification/user (hiện tại mặc định 50)

### 4.8 payment-service (mock)
- Mô phỏng luồng tạo/confirm/cancel/refund thanh toán
- Có endpoint thống kê và webhook giả lập
- Dùng cho demo hoặc commit benchmark

### 4.9 shipping-service (mock)
- Mô phỏng tạo shipment
- Cập nhật trạng thái vận chuyển
- Tracking theo tracking number
- Danh sách + thống kê shipment

---

## 5. Luồng request điển hình

### 5.1 Frontend gọi API qua gateway
1. Frontend gọi endpoint gateway (`/api-gate/...`)
2. Gateway route -> gateway handler
3. Gateway handler gọi utility HTTP sang service đích
4. Service xử lý nghiệp vụ và trả response
5. Gateway trả response cuối cho frontend

### 5.2 Luồng order -> notification
1. Order status thay đổi trong `order-service`
2. `order-service` gọi notification publish API
3. `notification-service` publish vào RabbitMQ
4. Consumer nhận message và lưu Redis list `notifications:{userId}`
5. Socket.IO emit realtime cho client đang online
6. Frontend trang notifications gọi API đọc theo tab buyer/seller/admin

---

## 6. Cấu hình môi trường
Mỗi service cần `.env` riêng.

### 6.1 Notification service quan trọng
- `RABBITMQ_URL`
- `REDIS_ENDPOINT`
- `REDIS_PORT`
- `REDIS_USERNAME`
- `REDIS_PASSWORD`
- `FRONTEND_URL`
- `NOTIFICATION_MAX_ITEMS`

### 6.2 Order service liên quan notification
- `NOTIFICATION_SERVICE_URL`
- `ADMIN_USER_IDS` (khuyến nghị)

---

## 7. Quy ước trạng thái

### 7.1 Order status
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### 7.2 Notification channel
- `buyer`
- `seller`
- `admin`

### 7.3 Shipping status (mock)
- `created`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `delivered`
- `delivery_failed`
- `returned`
- `cancelled`

---

## 8. Điểm mạnh hiện tại
- Tách service rõ ràng theo domain
- Có notification role-based
- Có pagination notification
- Có flow buy-now và share product ở frontend
- Có các mock service tương đối đầy đủ để demo/commit

---

## 9. Hạn chế kỹ thuật hiện tại
- Chưa có service discovery và config server trung tâm
- Chưa có tracing phân tán
- Chưa có auth middleware thống nhất ở mọi route nội bộ
- Một số service vẫn lưu tạm in-memory (payment/shipping mock)
- Chưa có CI test pipeline chuẩn hóa cho toàn monorepo

---

## 10. Định hướng mở rộng
1. Bổ sung message schema chuẩn cho event
2. Thêm idempotency key cho các thao tác thanh toán/đơn hàng
3. Tách adapter layer cho external providers (payment/shipping thật)
4. Bổ sung observability:
- structured logging
- metrics
- tracing
5. Chuẩn hóa tài liệu OpenAPI cho toàn bộ service

---

## 11. Checklist vận hành local
1. Khởi động Redis
2. Khởi động RabbitMQ
3. Cấu hình `.env` cho từng service
4. Chạy backend workspace (`npm run dev` tại `backend`)
5. Chạy frontend (`npm run dev` tại `frontend`)
6. Kiểm tra health các service

---

## 12. Kết luận
Backend đã đạt mức đủ tốt cho phát triển nghiệp vụ chính của đồ án: auth, catalog, cart, order, review, notification theo vai trò. Các mock service payment/shipping đã được mở rộng để tăng độ đầy đặn cho codebase và tài liệu commit.
