# Backend API Reference (Practical)

## 1. Giới thiệu
Tài liệu này mô tả nhanh các endpoint backend quan trọng đang được dùng trong dự án. Mục tiêu là phục vụ dev nội bộ: test thủ công, debug frontend, và onboarding.

> Lưu ý: Một số endpoint có thể thay đổi theo tiến độ phát triển.

---

## 2. Gateway Prefix
Hầu hết endpoint từ frontend gọi qua:
- `http://localhost:8080/api-gate/...`

Notification service hiện frontend gọi trực tiếp (config qua `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL`).

---

## 3. Auth Service
### 3.1 Sign up
- `POST /api-gate/auth-service/sign-up`

Body:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### 3.2 Sign in
- `POST /api-gate/auth-service/sign-in`

Response (rút gọn):
```json
{
  "message": "Login OK!",
  "data": {
    "payload": {
      "userId": "...",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "jwt..."
  }
}
```

---

## 4. Cart Service
### 4.1 Add item
- `POST /api-gate/cart-service/add-item-to-cart`

### 4.2 Remove item
- `POST /api-gate/cart-service/remove-item-from-cart`

### 4.3 Read cart
- `POST /api-gate/cart-service/read-cart`

Body:
```json
{
  "email": "user@example.com",
  "page": 1,
  "limit": 10
}
```

---

## 5. Product Service
### 5.1 Add product
- `POST /api-gate/product-service/add-product`

### 5.2 Update product
- `PATCH /api-gate/product-service/update-product`

### 5.3 Delete product
- `POST /api-gate/product-service/delete-product`

### 5.4 Get product by id
- `POST /api-gate/product-service/get-product-by-id`

### 5.5 Search products
- `POST /api-gate/product-service/search-products`

Body mẫu:
```json
{
  "page": 1,
  "limit": 20,
  "query": "shirt",
  "category": "mens-fashion",
  "shop_id": "...",
  "min_price": 10,
  "max_price": 100
}
```

---

## 6. Inventory Service
### 6.1 Shop
- `POST /api-gate/inventory-service/create-shop`
- `POST /api-gate/inventory-service/delete-shop`
- `PATCH /api-gate/inventory-service/update-shop-bank-info`
- `PATCH /api-gate/inventory-service/update-shop-info`
- `POST /api-gate/inventory-service/get-shops-by-owner`
- `POST /api-gate/inventory-service/get-shop-by-id`

### 6.2 Profile
- `POST /api-gate/inventory-service/create-profile`
- `POST /api-gate/inventory-service/get-profile`
- `PATCH /api-gate/inventory-service/update-profile`

---

## 7. Order Service
### 7.1 Create order
- `POST /api-gate/order-service/new-order`

Body mẫu:
```json
{
  "product_id": "...",
  "buyer": "buyer@example.com",
  "color": "Red",
  "size": 42,
  "payment": 0,
  "price": 120,
  "phone": "0901234567",
  "address": "123 Le Loi",
  "receiver": "Nguyen Van A",
  "quantity": 1,
  "seller": "Shop ABC",
  "shop_id": "..."
}
```

### 7.2 Buyer actions
- `PATCH /api-gate/order-service/modify-order`
- `PATCH /api-gate/order-service/cancel-order`

### 7.3 Seller actions
- `PATCH /api-gate/order-service/seller-accept-order`
- `PATCH /api-gate/order-service/seller-reject-order`

### 7.4 Admin actions
- `PATCH /api-gate/order-service/admin-ship-order`
- `PATCH /api-gate/order-service/admin-deliver-order`

### 7.5 Read lists
- `POST /api-gate/order-service/read-orders-by-buyer`
- `POST /api-gate/order-service/read-orders-by-shop`
- `POST /api-gate/order-service/read-all-orders`

---

## 8. Review Service
### 8.1 Add review
- `POST /api-gate/review-service/add-review`

### 8.2 Get reviews by product
- `POST /api-gate/review-service/get-reviews-by-product`

### 8.3 Product rating
- `POST /api-gate/review-service/get-product-rating`

### 8.4 Shop rating
- `POST /api-gate/review-service/get-shop-rating`

---

## 9. Notification Service (direct)
Base URL ví dụ:
- `http://localhost:4000/notification-service`

### 9.1 Health
- `GET /health`

### 9.2 Publish
- `POST /publish`

Body mẫu:
```json
{
  "toUserId": "user@example.com",
  "type": "ORDER_STATUS_CHANGED",
  "title": "Order updated",
  "body": "Your order is shipped",
  "data": {
    "channel": "buyer",
    "targetUrl": "/orders/order_123"
  }
}
```

### 9.3 Read notifications (paginated)
- `GET /read-notifications?userId=...&channel=buyer&page=1&limit=10`

Response `result`:
```json
{
  "currentPage": 1,
  "limit": 10,
  "totalItems": 24,
  "totalPages": 3,
  "items": []
}
```

---

## 10. Shipping Service (mock)
Base URL:
- `http://localhost:3006/shipping-service`

Endpoints:
- `GET /health`
- `POST /create-shipment`
- `GET /get-shipment/:shipmentId`
- `GET /track-shipment?trackingNumber=...`
- `PATCH /update-shipment-status/:shipmentId`
- `GET /list-shipments?status=&buyer=&shopId=&page=&limit=`
- `GET /stats`

---

## 11. Payment Service (mock)
Base URL:
- `http://localhost:5000`

Endpoints chính:
- `GET /health`
- `GET /payment-methods`
- `POST /payments`
- `POST /payments/:paymentId/confirm`
- `POST /payments/:paymentId/cancel`
- `POST /payments/:paymentId/refund`
- `GET /payments`
- `GET /payments/:paymentId`
- `GET /stats`
- `POST /webhooks/provider-callback`
- `POST /pay` (legacy)

---

## 12. Lưu ý khi test API
1. Kiểm tra service đang chạy đúng port.
2. Kiểm tra env kết nối Redis/RabbitMQ/Supabase.
3. Với notification, cần cả producer + consumer chạy ổn.
4. Nếu frontend không nhận realtime, kiểm tra CORS (`FRONTEND_URL`) và websocket handshake.
5. Nếu danh sách notification trống, kiểm tra `channel` có đúng `buyer/seller/admin` không.

---

## 13. Mẹo debug nhanh
- Log request body ở controller nếu nghi payload sai.
- Log response từ gateway utility khi nghi mất dữ liệu trung gian.
- Log publish/consume notification để xác định tắc nghẽn ở producer hay consumer.
- Với pagination, luôn kiểm tra `totalItems`, `totalPages`, `currentPage` trước khi nghi lỗi UI.
