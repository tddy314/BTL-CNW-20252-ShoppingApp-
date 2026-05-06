# Product Requirements

## 1. Functional Requirements

## 1.1 Authentication
- FR-AUTH-01: User có thể đăng ký bằng email/password.
- FR-AUTH-02: User có thể đăng nhập và nhận JWT token.
- FR-AUTH-03: Frontend phải duy trì session hợp lệ theo token.
- FR-AUTH-04: Hệ thống tự logout khi token hết hạn.

## 1.2 Product Catalog
- FR-PROD-01: User xem danh sách sản phẩm phân trang.
- FR-PROD-02: User lọc theo category và từ khóa.
- FR-PROD-03: User xem chi tiết sản phẩm.
- FR-PROD-04: Seller có thể tạo/cập nhật/xóa sản phẩm của shop mình.

## 1.3 Cart & Checkout
- FR-CART-01: User thêm sản phẩm vào giỏ hàng.
- FR-CART-02: User xóa sản phẩm khỏi giỏ hàng.
- FR-CART-03: User xem giỏ hàng theo trang.
- FR-CART-04: User tạo đơn từ giỏ hàng.
- FR-CART-05: User có thể Buy Now trực tiếp từ trang sản phẩm.

## 1.4 Order Lifecycle
- FR-ORDER-01: Tạo order mới trạng thái `pending`.
- FR-ORDER-02: Buyer có thể sửa thông tin nhận hàng khi trạng thái cho phép.
- FR-ORDER-03: Buyer có thể hủy order khi trạng thái cho phép.
- FR-ORDER-04: Seller có thể accept/reject order.
- FR-ORDER-05: Admin có thể ship/deliver order.
- FR-ORDER-06: Hệ thống ghi nhận trạng thái và lịch sử theo trình tự.

## 1.5 Inventory / Shop
- FR-SHOP-01: User tạo shop.
- FR-SHOP-02: User sửa thông tin shop và ngân hàng.
- FR-SHOP-03: User xem danh sách shop theo owner.
- FR-SHOP-04: User xem shop detail theo id.

## 1.6 Review
- FR-REV-01: Buyer có thể tạo review sản phẩm.
- FR-REV-02: Hệ thống trả danh sách review theo product.
- FR-REV-03: Hệ thống trả rating trung bình product/shop.

## 1.7 Notification
- FR-NOTI-01: Buyer nhận thông báo khi order tạo, đổi trạng thái, bị reject, shipped, delivered.
- FR-NOTI-02: Seller nhận thông báo khi shop có đơn mới hoặc buyer cancel.
- FR-NOTI-03: Admin nhận thông báo khi seller accept hoặc buyer cancel.
- FR-NOTI-04: Notification có phân trang theo tab buyer/seller/admin.
- FR-NOTI-05: Notification có điều hướng tới trang nghiệp vụ tương ứng.
- FR-NOTI-06: Giữ tối đa 50 notification gần nhất/user.

---

## 2. Non-Functional Requirements

## 2.1 Performance
- NFR-PERF-01: API cơ bản phản hồi trong mức chấp nhận được ở local/dev.
- NFR-PERF-02: Notification read API hỗ trợ pagination.

## 2.2 Reliability
- NFR-REL-01: Service lỗi một phần không được làm sập toàn hệ thống.
- NFR-REL-02: Notification flow dùng queue để giảm mất message ngắn hạn.

## 2.3 Security
- NFR-SEC-01: Không hardcode secrets vào source commit.
- NFR-SEC-02: JWT phải được kiểm tra hết hạn phía frontend session.
- NFR-SEC-03: Các endpoint quan trọng cần bổ sung auth middleware khi production hóa.

## 2.4 Maintainability
- NFR-MAIN-01: Service nên theo cấu trúc chuẩn routes/controllers/repository/config.
- NFR-MAIN-02: Tài liệu endpoint và flow phải cập nhật theo code.

## 2.5 Scalability
- NFR-SCALE-01: Có thể scale ngang notification consumer theo queue.
- NFR-SCALE-02: Có thể tách payment/shipping mock thành provider adapter thật trong tương lai.

---

## 3. Business Rules
- BR-01: Buyer chỉ sửa/hủy đơn khi đơn chưa ở trạng thái shipped/delivered/cancelled.
- BR-02: Seller chỉ accept/reject đơn ở trạng thái pending.
- BR-03: Admin chỉ ship đơn ở trạng thái processing.
- BR-04: Admin chỉ deliver đơn ở trạng thái shipped.
- BR-05: Notification buyer/seller/admin phải phân kênh rõ ràng.
- BR-06: Khi seller accept, admin phải nhận thông báo đặc biệt để tiếp tục flow vận hành.

---

## 4. Assumptions
- A-01: Email có thể được dùng như userId định danh trong nhiều flow hiện tại.
- A-02: Redis và RabbitMQ luôn sẵn sàng trong môi trường demo.
- A-03: Mock payment/shipping không cần tích hợp cổng thật.
- A-04: UI có thể dùng alert cho feedback ngắn hạn ở một số thao tác.

---

## 5. Constraints
- C-01: Dự án thiên về minh họa kiến trúc và luồng nghiệp vụ.
- C-02: Chưa có full pipeline CI/CD.
- C-03: Một phần nghiệp vụ còn dùng mock in-memory.
- C-04: Một số kiểm thử tự động bị giới hạn bởi môi trường chạy hiện tại.

---

## 6. Definition of Done (tham chiếu)
Một tính năng được xem là hoàn tất khi:
1. Có endpoint/backend xử lý hợp lệ.
2. Frontend gọi được endpoint và hiển thị đúng.
3. Có handling lỗi cơ bản.
4. Có tài liệu cập nhật tương ứng.
5. Không phá vỡ luồng hiện hữu sau smoke test.
