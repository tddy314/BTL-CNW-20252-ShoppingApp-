import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as productRouter } from "./routes/product.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: process.env.API_GATEWAY_URL || "http://localhost:8080",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/product-service", productRouter);

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
