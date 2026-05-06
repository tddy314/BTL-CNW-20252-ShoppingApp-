# Project Overview

## 1. Bối cảnh
Dự án Shopping App được phát triển theo hướng microservices để mô phỏng kiến trúc backend hiện đại cho một hệ thống thương mại điện tử. Mục tiêu của đồ án là xây dựng được luồng nghiệp vụ cốt lõi đầy đủ từ đăng nhập đến mua hàng, vận hành shop, xử lý đơn và thông báo theo vai trò.

## 2. Mục tiêu sản phẩm
1. Xây dựng trải nghiệm mua sắm trực tuyến cơ bản nhưng đủ chiều sâu nghiệp vụ.
2. Tách các domain chính thành service độc lập để dễ mở rộng và bảo trì.
3. Triển khai thông báo đa vai trò theo event (buyer/seller/admin).
4. Chuẩn hóa flow dữ liệu frontend -> gateway -> service.
5. Tạo nền tảng dễ demo, dễ test, dễ commit theo milestone.

## 3. Phạm vi tính năng hiện tại
### 3.1 Người dùng (Buyer)
- Đăng ký, đăng nhập
- Duyệt và tìm kiếm sản phẩm
- Xem chi tiết sản phẩm
- Chọn thuộc tính sản phẩm (màu, size, material)
- Thêm giỏ hàng
- Buy now trực tiếp từ trang chi tiết sản phẩm
- Xác nhận đơn hàng
- Theo dõi lịch sử đơn hàng
- Xem thông báo buyer

### 3.2 Người bán (Seller)
- Tạo và quản lý shop
- Đăng sản phẩm mới, cập nhật sản phẩm, xóa sản phẩm
- Xem đơn hàng của shop
- Accept/Reject đơn hàng
- Xem thông báo seller (đơn mới, buyer cancel)

### 3.3 Quản trị (Admin)
- Theo dõi đơn ở trạng thái cần vận hành
- Cập nhật trạng thái shipped / delivered
- Nhận thông báo admin khi seller accept hoặc buyer cancel

## 4. Kiến trúc tổng thể
### 4.1 Frontend
- Next.js App Router
- Context cho auth/session
- API client tập trung ở `frontend/app/utils/api.ts`

### 4.2 Backend
- API Gateway nhận request tập trung
- Service tách theo domain:
  - auth, cart, product, inventory, order, review, notification
  - mock service: payment, shipping

### 4.3 Data & messaging
- Supabase: dữ liệu nghiệp vụ chính
- Redis: cart + notification retention
- RabbitMQ: event bus cho notification

## 5. Giá trị kỹ thuật đạt được
1. Mô hình hóa domain tách biệt, dễ nâng cấp từng service.
2. Luồng event-driven cho notification giúp giảm coupling.
3. Role-based UX rõ ràng trên màn hình notifications.
4. Có mock service đủ lớn để commit/review kiến trúc.

## 6. Rủi ro hiện tại
1. Một số service mock chưa có persistence thực.
2. Chưa có observability stack chuẩn (metrics/tracing).
3. Chưa có pipeline CI kiểm thử đầy đủ cho toàn monorepo.
4. Phụ thuộc nhiều vào biến môi trường local.

## 7. Định hướng tiếp theo
1. Chuẩn hóa schema event giữa order và notification.
2. Thêm middleware xác thực đồng nhất ở gateway/service.
3. Tách logic provider-specific cho payment/shipping thật.
4. Thêm test integration xuyên service.
5. Chuẩn hóa OpenAPI docs cho toàn bộ endpoint.

## 8. Kết luận
Project đã đạt nền tảng vững cho đồ án: có đầy đủ luồng user chính, có phân tách kiến trúc rõ ràng, có thông báo theo vai trò và có khả năng mở rộng thành hệ thống production-grade theo từng bước.
