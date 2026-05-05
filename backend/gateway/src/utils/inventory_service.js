import axios from "axios";

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || "http://localhost:3003";

export class CallInventory {
    async createShop(payload) {
        const res = await axios.post(`${INVENTORY_SERVICE_URL}/inventory-service/create-shop`, payload);
        return res.data;
    }

    async deleteShop(payload) {
        const res = await axios.post(`${INVENTORY_SERVICE_URL}/inventory-service/delete-shop`, payload);
        return res.data;
    }

    async updateShopBankInfo(payload) {
        const res = await axios.patch(`${INVENTORY_SERVICE_URL}/inventory-service/update-shop-bank-info`, payload);
        return res.data;
    }

    async getShopsByOwner(payload) {
        const res = await axios.post(`${INVENTORY_SERVICE_URL}/inventory-service/get-shops-by-owner`, payload);
        return res.data;
    }

    async getShopById(payload) {
        const res = await axios.post(`${INVENTORY_SERVICE_URL}/inventory-service/get-shop-by-id`, payload);
        return res.data;
    }
}
