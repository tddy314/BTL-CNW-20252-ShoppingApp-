import { OrderRepository } from "../repository/order.repo.js";

export class OrderController {
    orderRepo;

    constructor() {
        this.orderRepo = new OrderRepository();
    }

    async newOrder(req, res) {
        try {
            const result = await this.orderRepo.newOrder(req.body);
            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async modifyOrder(req, res) {
        try {
            const {
                order_id,
                buyer,
                phone,
                address,
                receiver,
            } = req.body;

            if(!order_id || !buyer) {
                throw new Error("order_id and buyer are required");
            }

            const result = await this.orderRepo.modifyOrderByBuyer({
                order_id,
                buyer,
                phone,
                address,
                receiver,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const {
                order_id,
                buyer,
            } = req.body;

            if(!order_id || !buyer) {
                throw new Error("order_id and buyer are required");
            }

            const result = await this.orderRepo.cancelOrderByBuyer({
                order_id,
                buyer,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async sellerAcceptOrder(req, res) {
        try {
            const {
                order_id,
                seller,
            } = req.body;

            if(!order_id || !seller) {
                throw new Error("order_id and seller are required");
            }

            const result = await this.orderRepo.sellerAcceptOrder({
                order_id,
                seller,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async sellerRejectOrder(req, res) {
        try {
            const {
                order_id,
                seller,
            } = req.body;

            if(!order_id || !seller) {
                throw new Error("order_id and seller are required");
            }

            const result = await this.orderRepo.sellerRejectOrder({
                order_id,
                seller,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async adminShipOrder(req, res) {
        try {
            const { order_id } = req.body;

            if(!order_id) {
                throw new Error("order_id is required");
            }

            const result = await this.orderRepo.adminShipOrder({ order_id });
            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async adminDeliverOrder(req, res) {
        try {
            const { order_id } = req.body;

            if(!order_id) {
                throw new Error("order_id is required");
            }

            const result = await this.orderRepo.adminDeliverOrder({ order_id });
            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async readOrdersByBuyer(req, res) {
        try {
            const {
                buyer,
                page,
                limit,
            } = req.body;

            if(!buyer || !page || !limit) {
                throw new Error("buyer, page and limit are required");
            }

            const result = await this.orderRepo.readOrdersByBuyer({
                buyer,
                page,
                limit,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async readOrdersByShop(req, res) {
        try {
            const {
                shop_id,
                page,
                limit,
            } = req.body;

            if(!shop_id || !page || !limit) {
                throw new Error("shop_id, page and limit are required");
            }

            const result = await this.orderRepo.readOrdersByShop({
                shop_id,
                page,
                limit,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async readAllOrders(req, res) {
        try {
            const {
                page,
                limit,
            } = req.body;

            if(!page || !limit) {
                throw new Error("page and limit are required");
            }

            const result = await this.orderRepo.readAllOrders({
                page,
                limit,
            });

            res.status(200).json({ message: "OK", result });
        }
        catch(error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }
}
