import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import { router as authGate } from "./routes/auth_service.router.js";
import { router as cartGate } from "./routes/cart_service.route.js";
import { router as orderGate } from "./routes/order_service.route.js";
import { router as inventoryGate } from "./routes/inventory_service.route.js";
dotenv.config();

export const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api-gate/auth-service', authGate);
app.use('/api-gate/cart-service', cartGate);
app.use('/api-gate/order-service', orderGate);
app.use('/api-gate/inventory-service', inventoryGate);

app.listen(PORT, () => {
  console.log(`🚀 GateWay running on port ${PORT}`);
  console.log(`📡 API GateWay at http://localhost:${PORT}/api-gate`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
