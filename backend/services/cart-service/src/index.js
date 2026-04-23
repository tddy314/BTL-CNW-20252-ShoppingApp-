import { connectRedis } from "./config/database/redis.config.js";
import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import {router as cartRouter} from "./routes/cart.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.API_GATEWAY_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



await connectRedis();

app.use('/cart-service', cartRouter);

app.listen(PORT, () => {
  console.log(`🚀 Cart Service Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api-service`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
