import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as reviewRouter } from "./routes/review.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({
  origin: process.env.API_GATEWAY_URL || "http://localhost:8080",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/review-service", reviewRouter);

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});
