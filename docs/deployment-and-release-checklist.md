# Deployment and Release Checklist

## 1. Mục tiêu
Đảm bảo trước khi demo/release, hệ thống có thể chạy ổn định và các luồng nghiệp vụ chính không bị vỡ.

---

## 2. Pre-Deployment Checklist

## 2.1 Source control
- [ ] Branch đã merge các thay đổi cần thiết.
- [ ] Không còn conflict.
- [ ] Không commit file secret `.env` nhạy cảm (nếu repo public).
- [ ] README/docs đã cập nhật theo thay đổi mới.

## 2.2 Dependency
- [ ] `npm install` thành công tại `backend`.
- [ ] `npm install` thành công tại `frontend`.
- [ ] Service mới thêm dependency đã được install (ví dụ notification-service dùng `redis`).

## 2.3 Environment
- [ ] Supabase keys hợp lệ cho các service cần dùng.
- [ ] Redis config hợp lệ (`REDIS_ENDPOINT`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`).
- [ ] RabbitMQ URL hợp lệ.
- [ ] `NOTIFICATION_SERVICE_URL` đúng ở order-service.
- [ ] `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` đúng ở frontend.
- [ ] `FRONTEND_URL` đúng ở notification-service cho CORS.

---

## 3. Service Startup Order (khuyến nghị)
1. Redis
2. RabbitMQ
3. notification-service
4. order-service
5. các service còn lại + gateway
6. frontend

Lý do:
- order-service phát event notification cần notification-service sẵn sàng.
- notification-service cần Redis/RabbitMQ trước để tránh lỗi startup.

---

## 4. Smoke Test sau deploy

## 4.1 Auth
- [ ] Login thành công
- [ ] Token lưu và restore đúng
- [ ] Token hết hạn auto logout

## 4.2 Product / Cart / Buy Now
- [ ] Vào `/products` bình thường
- [ ] Vào `/products/:id` bình thường
- [ ] Buy Now điều hướng đúng `confirm-order` và giữ selected options
- [ ] Share Product copy URL

## 4.3 Order lifecycle
- [ ] Create order thành công
- [ ] Seller accept/reject thành công
- [ ] Admin ship/deliver thành công
- [ ] Buyer cancel hoạt động khi trạng thái cho phép

## 4.4 Notification
- [ ] Buyer tab có dữ liệu đúng
- [ ] Seller tab có dữ liệu đúng
- [ ] Admin tab có dữ liệu đúng
- [ ] Pagination hoạt động
- [ ] Click notification điều hướng đúng page

---

## 5. Rollback Plan (cơ bản)
1. Nếu lỗi frontend:
- rollback commit frontend gần nhất
- giữ backend đang chạy

2. Nếu lỗi backend service riêng lẻ:
- rollback service đó
- restart service
- giữ service khác không động vào

3. Nếu lỗi env:
- phục hồi `.env` phiên bản stable gần nhất
- restart service liên quan

---

## 6. Post-Deployment Checks
- [ ] Không có error log lặp lại liên tục.
- [ ] CPU/RAM không tăng bất thường khi thao tác cơ bản.
- [ ] Không có endpoint critical trả 5xx liên tục.
- [ ] Notification retention vẫn giữ đúng giới hạn 50/user.

---

## 7. Release Notes Template
```text
Release: vX.Y.Z
Date:
Scope:
- Feature 1
- Feature 2
- Bugfix 1

Services changed:
- gateway
- order-service
- notification-service
- frontend

Migration/Config notes:
- add env A
- update env B

Known limitations:
- ...
```

---

## 8. Demo Readiness
- [ ] Đã chuẩn bị 3 account buyer/seller/admin.
- [ ] Có dữ liệu sản phẩm/shop mẫu.
- [ ] Có kịch bản fallback khi một service mock lỗi.
- [ ] Có log terminal sẵn để giải thích flow kỹ thuật.
