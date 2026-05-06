# User Flows and Role Matrix

## 1. Vai trò hệ thống
- Buyer: người mua hàng
- Seller: chủ shop / người bán
- Admin: vận hành đơn hàng mức hệ thống

---

## 2. Role Matrix (quyền theo chức năng)

| Chức năng | Buyer | Seller | Admin |
|---|---|---|---|
| Đăng ký/Đăng nhập | ✅ | ✅ | ✅ |
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Tạo shop | ✅ | ✅ | ✅ |
| Đăng sản phẩm | ❌ | ✅ | ✅ |
| Thêm vào giỏ hàng | ✅ | ✅ | ✅ |
| Buy Now | ✅ | ✅ | ✅ |
| Tạo đơn hàng | ✅ | ✅ | ✅ |
| Sửa đơn (buyer info) | ✅ (đơn của mình) | ❌ | ❌ |
| Hủy đơn | ✅ (đơn của mình) | ❌ | ❌ |
| Accept/Reject đơn | ❌ | ✅ (đơn shop mình) | ✅ (nếu cần) |
| Ship/Deliver đơn | ❌ | ❌ | ✅ |
| Review sản phẩm | ✅ | ✅ | ✅ |
| Xem noti buyer | ✅ | ✅ | ✅ |
| Xem noti seller | ❌ (trừ khi có shop) | ✅ | ✅ |
| Xem noti admin | ❌ | ❌ | ✅ |

---

## 3. Luồng Buyer
1. Buyer đăng nhập.
2. Buyer vào trang `/products` để tìm sản phẩm.
3. Buyer vào trang chi tiết `/products/:id`.
4. Buyer chọn biến thể (color/size/material), quantity.
5. Buyer chọn:
   - Add to Cart -> `/cart` -> `/confirm-order`
   - Buy Now -> `/confirm-order?from=buy-now...`
6. Buyer tạo order thành công -> vào `/orders`.
7. Buyer theo dõi status order và nhận notification tương ứng.
8. Buyer có thể hủy order nếu status còn cho phép.

---

## 4. Luồng Seller
1. Seller đăng nhập.
2. Seller vào `/my-shops` để chọn shop.
3. Seller quản lý sản phẩm tại `/shop/:id`.
4. Seller xem đơn shop tại `/shop/:id/orders`.
5. Seller accept/reject order pending.
6. Khi buyer cancel, seller nhận notification tab seller.

---

## 5. Luồng Admin
1. Admin đăng nhập bằng tài khoản role admin.
2. Khi seller accept order, admin nhận notification tab admin.
3. Admin vào màn hình vận hành đơn để ship/deliver.
4. Khi buyer cancel order, admin cũng nhận notification.

---

## 6. Notification Matrix theo sự kiện

| Sự kiện | Buyer | Seller | Admin |
|---|---|---|---|
| Tạo order | ✅ | ✅ (shop có đơn mới) | ❌ |
| Seller accept | ✅ | ❌ | ✅ |
| Seller reject | ✅ | ❌ | ❌ |
| Admin shipped | ✅ | ❌ | ❌ |
| Admin delivered | ✅ | ❌ | ❌ |
| Buyer cancel | ❌ | ✅ | ✅ |

---

## 7. Mapping điều hướng từ notification
- Buyer notification -> `/orders/:orderId`
- Seller notification -> `/shop/:shopId/orders`
- Admin notification -> `/admin/in-progress-orders`

---

## 8. UX yêu cầu tối thiểu
1. Notification chia tab rõ ràng theo role context.
2. Mỗi notification có timestamp.
3. Có phân trang danh sách notification.
4. Click notification phải dẫn tới đúng màn hình xử lý.

---

## 9. Edge Cases cần lưu ý
1. User vừa là buyer vừa là seller: cần xem cả 2 tab buyer/seller.
2. Admin đồng thời có shop: vẫn cần tab admin riêng.
3. Notification lỗi channel: fallback về buyer hoặc bỏ qua theo policy.
4. Link target không hợp lệ: nên fallback về trang danh sách tương ứng.

---

## 10. Kết luận
Role matrix hiện tại đảm bảo tách bạch trách nhiệm rõ ràng giữa buyer/seller/admin, đồng thời vẫn hỗ trợ trường hợp một account có nhiều ngữ cảnh sử dụng.
