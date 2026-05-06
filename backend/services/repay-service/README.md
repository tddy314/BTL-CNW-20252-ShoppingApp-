# Repay Service (Mock)

Service mock cho nghiệp vụ trả góp/hoàn trả khoản trả góp, triển khai theo standard folder structure để commit và demo nội bộ.

## Cấu trúc
- `src/index.js`: bootstrap service
- `src/routes/repay.route.js`: định nghĩa endpoint
- `src/controllers/repay.controller.js`: xử lý request/response
- `src/repository/repay.repo.js`: business logic + dữ liệu in-memory

## Endpoints
- `GET /repay-service/health`
- `POST /repay-service/create-plan`
- `GET /repay-service/get-plan/:planId`
- `GET /repay-service/list-plans?status=&customerId=&orderId=&page=&limit=`
- `POST /repay-service/repay-installment/:planId`
- `POST /repay-service/cancel-plan/:planId`
- `POST /repay-service/mark-overdue`
- `GET /repay-service/stats`

## Ví dụ payload tạo plan
```json
{
  "customerId": "buyer@example.com",
  "orderId": "order_20260506_001",
  "principalAmount": 1200,
  "currency": "USD",
  "annualInterestRate": 7.5,
  "termMonths": 12,
  "startedAt": "2026-05-06T10:00:00.000Z",
  "note": "Installment plan for premium order"
}
```

## Ví dụ payload thanh toán kỳ
```json
{
  "installmentNo": 1,
  "amount": 104.65,
  "note": "Paid via bank transfer"
}
```

## Chạy local
```bash
cd backend/services/repay-service
npm install
npm run dev
```

## Ghi chú
- Đây là mock service, dữ liệu lưu in-memory.
- Không tích hợp vào gateway hay frontend theo mặc định.
- Mục tiêu chính: tạo code/service đầy đủ để commit milestone.
