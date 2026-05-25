import axios from "axios";

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3002";

export class CallOrder {
    async newOrder(payload) {
        const res = await axios.post(`${ORDER_SERVICE_URL}/order-service/new-order`, payload);
        return res.data;
    }

    async modifyOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/modify-order`, payload);
        return res.data;
    }

    async cancelOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/cancel-order`, payload);
        return res.data;
    }

    async sellerAcceptOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/seller-accept-order`, payload);
        return res.data;
    }

    async sellerRejectOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/seller-reject-order`, payload);
        return res.data;
    }

    async sellerRefundCancelledOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/seller-refund-cancelled-order`, payload);
        return res.data;
    }

    async adminShipOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/admin-ship-order`, payload);
        return res.data;
    }

    async adminDeliverOrder(payload) {
        const res = await axios.patch(`${ORDER_SERVICE_URL}/order-service/admin-deliver-order`, payload);
        return res.data;
    }

    async readOrdersByBuyer(payload) {
        const res = await axios.post(`${ORDER_SERVICE_URL}/order-service/read-orders-by-buyer`, payload);
        return res.data;
    }

    async readOrdersByShop(payload) {
        const res = await axios.post(`${ORDER_SERVICE_URL}/order-service/read-orders-by-shop`, payload);
        return res.data;
    }

    async readAllOrders(payload) {
        const res = await axios.post(`${ORDER_SERVICE_URL}/order-service/read-all-orders`, payload);
        return res.data;
    }
}
