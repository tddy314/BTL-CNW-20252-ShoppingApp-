import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import { router as authGate } from "./routes/auth_service.router.js";
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

app.listen(PORT, () => {
  console.log(`🚀 GateWay running on port ${PORT}`);
  console.log(`📡 API GateWay at http://localhost:${PORT}/api-gate`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
