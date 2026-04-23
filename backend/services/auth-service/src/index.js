import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import { router as authRouter } from "./routes/auth.route.js";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.API_GATEWAY_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/auth-service', authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Auth Service Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/auth-service`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
