import { CallInventory } from "../utils/inventory_service.js";

export class InventoryGateWay {
    inventory_service;

    constructor() {
        this.inventory_service = new CallInventory();
    }

    buildErrorMessage(error) {
        return error?.response?.data?.message || error.message || "Unexpected inventory gateway error";
    }

    async createShop(req, res) {
        try {
            const result = await this.inventory_service.createShop(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async deleteShop(req, res) {
        try {
            const result = await this.inventory_service.deleteShop(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async updateShopBankInfo(req, res) {
        try {
            const result = await this.inventory_service.updateShopBankInfo(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async getShopsByOwner(req, res) {
        try {
            const result = await this.inventory_service.getShopsByOwner(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }

    async getShopById(req, res) {
        try {
            const result = await this.inventory_service.getShopById(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ message: "Error: " + this.buildErrorMessage(error) });
        }
    }
}
