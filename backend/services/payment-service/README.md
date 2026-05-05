# Payment Service

Minimal mock Payment Service used for demos and local development.

Endpoints:

- `GET /health` - health check
- `POST /pay` - simulate a payment; body: `{ amount, method, orderId? }`

Run locally:

```
npm install
npm run dev
```
