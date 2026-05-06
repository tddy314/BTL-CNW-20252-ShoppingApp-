# BTL-CNW-20252 Shopping App

## 1. Tổng quan hệ thống
Đây là dự án web thương mại điện tử theo kiến trúc **microservices** gồm:
- **Frontend**: Next.js (React) cho giao diện người dùng.
- **API Gateway**: gom và điều phối request từ frontend tới các service backend.
- **Backend Services**: mỗi nghiệp vụ tách thành service riêng (auth, product, order, cart, inventory, review, notification, ...).
- **Dữ liệu**:
  - **Supabase**: dữ liệu chính (user, sản phẩm, đơn hàng, shop, đánh giá).
  - **Redis**: giỏ hàng và lưu notification gần nhất theo user.
  - **RabbitMQ**: hàng đợi sự kiện notification.

---

## 2. Kiến trúc chính
### Frontend (`/frontend`)
- Next.js App Router.
- Các trang chính: trang chủ, sản phẩm, chi tiết sản phẩm, giỏ hàng, xác nhận đơn, đơn hàng, shop, thông báo.
- Gọi API qua `frontend/app/utils/api.ts`.

### Gateway (`/backend/gateway`)
- Nhận request từ frontend tại prefix `/api-gate/...`.
- Chuyển tiếp tới các service tương ứng.

### Các service backend (`/backend/services`)
- `auth-service`: đăng ký/đăng nhập.
- `product-service`: CRUD và tìm kiếm sản phẩm.
- `inventory-service`: quản lý shop/profile.
- `cart-service`: giỏ hàng Redis.
- `order-service`: tạo/sửa/hủy đơn, seller accept/reject, admin ship/deliver.
- `review-service`: đánh giá sản phẩm/shop.
- `notification-service`: xử lý thông báo realtime + lưu Redis + RabbitMQ consumer.
- `payment-service`, `shipping-service` (phần mở rộng nghiệp vụ).

---

## 3. Luồng nghiệp vụ nổi bật
### Đơn hàng
1. User chọn sản phẩm và đặt hàng (qua giỏ hàng hoặc Buy Now).
2. `order-service` tạo order trạng thái `pending`.
3. Seller accept/reject:
   - Accept -> `processing`
   - Reject -> `cancelled`
4. Admin xử lý:
   - Ship -> `shipped`
   - Deliver -> `delivered`

### Notification
- `order-service` phát sự kiện sang `notification-service` khi có thay đổi quan trọng (create/accept/reject/shipped/delivered/cancel).
- `notification-service`:
  - Đẩy message qua RabbitMQ
  - Consumer nhận và lưu Redis theo key `notifications:{userId}`
  - Phát realtime qua Socket.IO
- Frontend trang `/notifications` hiển thị theo tab:
  - Buyer
  - Seller
  - Admin (nếu role admin)
- Có phân trang thông báo và giữ tối đa **50** thông báo mới nhất/user.

---

## 4. Cấu trúc thư mục
```text
.
├─ frontend/
├─ backend/
│  ├─ gateway/
│  └─ services/
│     ├─ auth-service/
│     ├─ cart-service/
│     ├─ inventory-service/
│     ├─ notification-service/
│     ├─ order-service/
│     ├─ product-service/
│     ├─ review-service/
│     └─ ...
├─ docs/
└─ infra/
```

---

## 5. Cách chạy cơ bản (local)
### Yêu cầu
- Node.js 18+
- Redis
- RabbitMQ
- Tài khoản Supabase + biến môi trường hợp lệ

### Chạy frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend mặc định chạy ở `http://localhost:8000`.

### Chạy backend (multi service)
```bash
cd backend
npm install
npm run dev
```
Lệnh này chạy đồng thời gateway + các service đã cấu hình trong script.

---

## 6. Ghi chú cấu hình
- Mỗi service có file `.env` riêng.
- `notification-service` cần đúng cấu hình:
  - Redis endpoint/user/password
  - RabbitMQ URL
  - `NOTIFICATION_MAX_ITEMS=50`
- Frontend có thể cần:
  - `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost:4000`

---

## 7. Trạng thái hiện tại
Hệ thống đã có các chức năng chính của một sàn thương mại điện tử mẫu:
- Auth, sản phẩm, giỏ hàng, đơn hàng, shop, đánh giá.
- Notification theo vai trò buyer/seller/admin.
- Điều hướng từ notification tới trang nghiệp vụ tương ứng.
