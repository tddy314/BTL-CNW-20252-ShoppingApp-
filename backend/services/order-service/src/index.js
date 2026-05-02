import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as orderRouter } from "./routes/order.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
	origin: process.env.API_GATEWAY_URL || "http://localhost:8080",
	credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/order-service", orderRouter);

app.listen(PORT, () => {
	console.log(`Order Service running on port ${PORT}`);
});
