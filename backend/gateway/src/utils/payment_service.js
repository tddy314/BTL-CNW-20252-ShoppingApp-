import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.PAYMENT_SERVICE_URL;

export class CallPayment {
    async health() {
        const res = await axios.get(`${URL}/payment/health`);
        return res.data;
    }

    async pay(payload) {
        const res = await axios.post(`${URL}/payment/pay`, payload);
        return res.data;
    }

    async uploadReceipt(formData, headers) {
        const res = await axios.post(`${URL}/payment/upload-receipt`, formData, { headers });
        return res.data;
    }
}
