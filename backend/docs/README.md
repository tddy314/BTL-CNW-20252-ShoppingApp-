# Backend Documentation Index

Tài liệu backend hiện có trong thư mục `backend/docs`:

## 1. Kiến trúc
- [backend-architecture.md](./backend-architecture.md)

Mô tả:
- Tổng quan kiến trúc microservices
- Trách nhiệm từng service
- Luồng request và luồng event notification
- Hạn chế hiện tại và định hướng mở rộng

## 2. API Reference
- [backend-api-reference.md](./backend-api-reference.md)

Mô tả:
- Endpoint theo nhóm service
- Payload mẫu
- Các route notification/payment/shipping
- Mẹo debug khi test API

## 3. Setup + Operations
- [backend-setup-operations.md](./backend-setup-operations.md)

Mô tả:
- Hướng dẫn setup local
- Mẫu biến môi trường
- Health check, checklist commit/demo
- Các lỗi thường gặp và cách xử lý

---

## Ghi chú
Các tài liệu này phục vụ mục tiêu:
1. Onboarding thành viên mới nhanh
2. Chuẩn hóa vận hành local
3. Dễ audit lại flow nghiệp vụ trước khi demo
4. Tạo commit docs rõ ràng theo từng milestone
