# Testing and QA Plan

## 1. Mục tiêu QA
- Đảm bảo luồng nghiệp vụ chính hoạt động ổn định.
- Phát hiện regression sau mỗi lần thay đổi service/route.
- Xác nhận tính đúng đắn của phân quyền và notification theo role.

---

## 2. Phạm vi kiểm thử
### 2.1 In scope
- Auth flow
- Product browsing/search/detail
- Cart + confirm order
- Buy now flow
- Order lifecycle
- Notification role tabs + pagination
- Seller shop orders actions

### 2.2 Out of scope tạm thời
- Payment gateway thật
- Shipping provider thật
- Performance stress test quy mô lớn
- Security pentest chuyên sâu

---

## 3. Chiến lược test
1. Smoke test sau mỗi lần khởi động stack.
2. Functional test theo từng module.
3. Integration test theo chuỗi buyer -> seller -> admin.
4. Regression test nhanh cho các màn hình thường vỡ.
5. Negative test cho payload thiếu/sai.

---

## 4. Test Data đề xuất
- Buyer account: `buyer1@example.com`
- Seller account: `seller1@example.com`
- Admin account: `admin1@example.com`
- Shop mẫu: `shop_1`
- Product mẫu: 2-3 sản phẩm có nhiều thuộc tính

---

## 5. Test Cases trọng yếu

## 5.1 Auth
- TC-AUTH-01: login thành công với user hợp lệ.
- TC-AUTH-02: login fail khi sai password.
- TC-AUTH-03: token hết hạn -> auto logout.

## 5.2 Product
- TC-PROD-01: vào trang products hiển thị danh sách.
- TC-PROD-02: filter + sort hoạt động.
- TC-PROD-03: click sản phẩm vào trang chi tiết.

## 5.3 Buy Now
- TC-BN-01: chọn thuộc tính + Buy Now -> điều hướng confirm-order với đủ thông tin.
- TC-BN-02: tạo order từ buy-now thành công.
- TC-BN-03: share product copy đúng URL vào clipboard.

## 5.4 Cart
- TC-CART-01: add item vào cart.
- TC-CART-02: remove item khỏi cart.
- TC-CART-03: pagination cart hoạt động.

## 5.5 Order lifecycle
- TC-ORD-01: buyer tạo order -> pending.
- TC-ORD-02: seller accept -> processing.
- TC-ORD-03: seller reject -> cancelled.
- TC-ORD-04: admin ship -> shipped.
- TC-ORD-05: admin deliver -> delivered.
- TC-ORD-06: buyer cancel ở trạng thái hợp lệ -> cancelled.

## 5.6 Notification
- TC-NOTI-01: buyer nhận noti khi tạo order.
- TC-NOTI-02: seller nhận noti khi có đơn mới.
- TC-NOTI-03: admin nhận noti khi seller accept.
- TC-NOTI-04: seller + admin nhận noti khi buyer cancel.
- TC-NOTI-05: tab buyer/seller/admin tách đúng channel.
- TC-NOTI-06: pagination noti hoạt động đúng.
- TC-NOTI-07: click noti điều hướng đúng màn hình.
- TC-NOTI-08: retention noti tối đa 50/user.

---

## 6. Regression Checklist nhanh
1. Login/logout
2. Product list/detail
3. Add cart + remove cart
4. Buy now + confirm order
5. Seller accept/reject
6. Admin ship/deliver
7. Notifications 3 tab
8. Navigation chính từ homepage

---

## 7. Severity guideline
- P0: không thể tạo order hoặc hệ thống không truy cập được
- P1: sai trạng thái đơn, sai phân quyền, mất notification critical
- P2: lỗi UI/UX có workaround
- P3: lỗi nhỏ về text/log/format

---

## 8. Exit Criteria cho vòng test
- 100% test case critical pass
- Không còn bug P0/P1 mở
- Bug P2 có workaround rõ ràng
- Demo script chạy liền mạch end-to-end

---

## 9. Lưu ý môi trường test
- Xác minh Redis/RabbitMQ/Supabase hoạt động trước khi test.
- Với notification realtime, nếu không thấy update tức thì, test fallback bằng refresh + API read-notifications.
- Tách lỗi môi trường và lỗi logic để tránh false-positive bug.
