import { CallOrder } from "../utils/order_service.js";

export class OrderGateWay {
    order_service;

    constructor() {
        this.order_service = new CallOrder();
    }

    buildErrorMessage(error) {
        return error?.response?.data?.message || error.message || "Unexpected order gateway error";
    }

    async newOrder(req, res) {
        try {
            const result = await this.order_service.newOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async modifyOrder(req, res) {
        try {
            const result = await this.order_service.modifyOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async cancelOrder(req, res) {
        try {
            const result = await this.order_service.cancelOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async sellerAcceptOrder(req, res) {
        try {
            const result = await this.order_service.sellerAcceptOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async sellerRejectOrder(req, res) {
        try {
            const result = await this.order_service.sellerRejectOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async adminShipOrder(req, res) {
        try {
            const result = await this.order_service.adminShipOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async adminDeliverOrder(req, res) {
        try {
            const result = await this.order_service.adminDeliverOrder(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async readOrdersByBuyer(req, res) {
        try {
            const result = await this.order_service.readOrdersByBuyer(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async readOrdersByShop(req, res) {
        try {
            const result = await this.order_service.readOrdersByShop(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async readAllOrders(req, res) {
        try {
            const result = await this.order_service.readAllOrders(req.body);
            return res.status(200).json(result);
        }
        catch(error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }
}
