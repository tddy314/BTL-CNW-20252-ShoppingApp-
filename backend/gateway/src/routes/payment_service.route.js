import express from "express";
import multer from "multer";
import { PaymentGateWay } from "../gateways/payment_service.gateway.js";

export const router = express.Router();
const paymentGate = new PaymentGateWay();
const upload = multer();

router.get('/health', paymentGate.health.bind(paymentGate));
router.post('/pay', paymentGate.pay.bind(paymentGate));
router.post('/upload-receipt', upload.single('receipt'), paymentGate.uploadReceipt.bind(paymentGate));
