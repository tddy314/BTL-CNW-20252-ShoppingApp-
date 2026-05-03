import { CallPayment } from "../utils/payment_service.js";
import FormData from "form-data";

export class PaymentGateWay {
    payment_service;
    constructor() {
        this.payment_service = new CallPayment();
    }

    buildErrorMessage(error) {
        return error?.response?.data?.message || error.message || "Unexpected payment gateway error";
    }

    async health(req, res) {
        try {
            const result = await this.payment_service.health();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async pay(req, res) {
        try {
            const result = await this.payment_service.pay(req.body);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async uploadReceipt(req, res) {
        try {
            // forward multipart form-data
            const form = new FormData();
            if (req.file) {
                form.append('receipt', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
            }
            Object.keys(req.body || {}).forEach(k => form.append(k, req.body[k]));

            const headers = form.getHeaders();
            const result = await this.payment_service.uploadReceipt(form, headers);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }
}
