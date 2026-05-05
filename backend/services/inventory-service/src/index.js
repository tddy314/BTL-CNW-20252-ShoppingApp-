import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as shopRouter } from "./routes/shop.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({
  origin: process.env.API_GATEWAY_URL || "http://localhost:8080",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/inventory-service", shopRouter);

app.listen(PORT, () => {
  console.log(`🚀 Inventory Service running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/inventory-service`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
