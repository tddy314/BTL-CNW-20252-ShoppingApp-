# Shipping Service (Mock)

Shipping service theo cấu trúc chuẩn để phục vụ demo và commit.

## Cấu trúc
- `src/index.js`: khởi động service
- `src/routes/shipping.route.js`: định nghĩa endpoint
- `src/controllers/shipping.controller.js`: xử lý request/response
- `src/repository/shipping.repo.js`: business logic + mock data in-memory

## Endpoints
- `GET /shipping-service/health`
- `POST /shipping-service/create-shipment`
- `GET /shipping-service/get-shipment/:shipmentId`
- `GET /shipping-service/track-shipment?trackingNumber=...`
- `PATCH /shipping-service/update-shipment-status/:shipmentId`
- `GET /shipping-service/list-shipments?status=&buyer=&shopId=&page=&limit=`
- `GET /shipping-service/stats`

## Ví dụ payload tạo shipment
```json
{
  "orderId": "order_123",
  "buyer": "user@example.com",
  "receiver": "Nguyen Van A",
  "phone": "0901234567",
  "address": "123 Le Loi",
  "district": "Quan 1",
  "city": "Ho Chi Minh",
  "country": "VN",
  "shopId": "shop_1",
  "seller": "seller@example.com",
  "packageInfo": {
    "weightKg": 1.2,
    "lengthCm": 25,
    "widthCm": 20,
    "heightCm": 10,
    "declaredValue": 300
  },
  "shippingOption": {
    "carrier": "FASTEXPRESS",
    "distanceKm": 12,
    "fragile": false,
    "express": true
  }
}
```

## Chạy local
```bash
cd backend/services/shipping-service
npm install
npm run dev
```
