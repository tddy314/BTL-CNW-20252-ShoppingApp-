# Demo Script

## 1. Mục tiêu demo
- Chứng minh hệ thống chạy theo role-based business flow.
- Chứng minh kiến trúc backend tách service rõ ràng.
- Chứng minh notification event-driven hoạt động end-to-end.

---

## 2. Chuẩn bị trước demo
1. Start Redis
2. Start RabbitMQ
3. Start backend services (gateway + services)
4. Start frontend
5. Chuẩn bị sẵn 3 account:
- buyer@example.com
- seller@example.com
- admin@example.com

---

## 3. Kịch bản demo chính (10-15 phút)

## Bước 1: Giới thiệu nhanh hệ thống
- Mở trang chủ
- Nói ngắn về kiến trúc frontend + gateway + microservices

## Bước 2: Buyer flow
1. Login buyer
2. Vào `/products`
3. Mở trang chi tiết sản phẩm
4. Chọn thuộc tính sản phẩm + quantity
5. Click **Buy Now**
6. Xác nhận trang confirm-order đã nhận đủ thông tin đã chọn
7. Tạo order thành công
8. Vào `/orders` để thấy order vừa tạo

Điểm nhấn:
- Buy now không cần qua cart vẫn tạo order được
- Dữ liệu selected option truyền đúng

## Bước 3: Seller flow
1. Login seller
2. Vào `/my-shops` -> chọn shop
3. Vào `/shop/:id/orders`
4. Thấy order mới ở pending
5. Seller click Accept

Điểm nhấn:
- Trạng thái đổi từ pending -> processing
- Hệ thống phát notification liên quan

## Bước 4: Admin flow
1. Login admin
2. Vào `/notifications`, mở tab Admin
3. Thấy notification khi seller accept
4. Vào màn hình admin xử lý đơn (in-progress)
5. Thực hiện ship -> deliver

Điểm nhấn:
- Notification admin tách tab riêng
- Buyer sẽ nhận update status tương ứng

## Bước 5: Buyer nhận thông báo
1. Quay lại account buyer
2. Vào `/notifications` tab Buyer
3. Kiểm tra có noti create/accept/shipped/delivered
4. Click từng noti -> điều hướng vào order detail

Điểm nhấn:
- Notification có điều hướng đúng ngữ cảnh
- Pagination hoạt động khi đủ dữ liệu

---

## 4. Kịch bản bổ sung (nếu còn thời gian)

## 4.1 Buyer cancel order
1. Tạo order mới
2. Buyer cancel ở trạng thái cho phép
3. Seller tab nhận noti cancel
4. Admin tab cũng nhận noti cancel

## 4.2 Share Product
1. Vào product detail
2. Click Share Product
3. Paste link vừa copy để chứng minh đúng URL sản phẩm

## 4.3 Homepage navigation
1. Click Start Shopping -> `/products`
2. Click Sell on ShopHub -> `/my-shops`

---

## 5. Talking points kỹ thuật
- Vì sao dùng RabbitMQ cho notification:
  - giảm coupling giữa order-service và realtime layer
- Vì sao lưu notification vào Redis:
  - hỗ trợ lịch sử gần + pagination nhanh
- Vì sao tách tab buyer/seller/admin:
  - tránh trộn ngữ cảnh nghiệp vụ

---

## 6. Kịch bản xử lý sự cố khi demo

## Tình huống 1: Realtime không push ngay
- Refresh trang notifications để đọc lại từ Redis API
- Giải thích realtime là enhancement, dữ liệu persisted vẫn chính xác

## Tình huống 2: Một service mock lỗi
- Trình bày fallback: focus vào flow core (order + notification)
- Mở logs để chứng minh service nào lỗi và vì sao

## Tình huống 3: Account role sai
- Đăng nhập account khác đã chuẩn bị trước

---

## 7. Checklist trước khi bắt đầu demo
- [ ] Redis chạy
- [ ] RabbitMQ chạy
- [ ] Notification service chạy
- [ ] Order service chạy
- [ ] Frontend chạy
- [ ] Có sẵn dữ liệu product/shop
- [ ] Có sẵn buyer/seller/admin account
- [ ] Kiểm tra nhanh `/notifications` load được

---

## 8. Kết thúc demo
Tổng kết theo 3 ý:
1. Hệ thống đã hoàn thiện luồng nghiệp vụ chính của sàn TMĐT.
2. Kiến trúc backend tách service rõ, dễ mở rộng.
3. Notification theo vai trò hoạt động end-to-end với pagination và điều hướng đúng ngữ cảnh.
