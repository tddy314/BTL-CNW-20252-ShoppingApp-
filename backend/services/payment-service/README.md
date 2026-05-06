# Payment Service

Mock Payment Service used for demos, local development, and testing commit flows.

Endpoints:

- `GET /health` - health check + basic runtime stats
- `GET /payment-methods` - list supported payment methods and constraints
- `GET /payments` - list payments (optional query: `status`, `orderId`, `method`)
- `GET /payments/:paymentId` - get payment details
- `POST /payments` - create payment intent
- `POST /payments/:paymentId/confirm` - confirm payment (supports `forceFail` for testing)
- `POST /payments/:paymentId/cancel` - cancel payment intent
- `POST /payments/:paymentId/refund` - refund succeeded payment (full/partial)
- `GET /stats` - aggregated mock statistics
- `POST /webhooks/provider-callback` - mock provider webhook callback
- `POST /pay` - backward-compatible legacy endpoint

Run locally:

```
npm install
npm run dev
```

Run tests:

```
npm test
```
