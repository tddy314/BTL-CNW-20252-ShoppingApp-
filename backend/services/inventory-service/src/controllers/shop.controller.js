import { ShopRepository } from "../repository/shop.repo.js";

export class ShopController {
    shopRepo;

    constructor() {
        this.shopRepo = new ShopRepository();
    }

    async createShop(req, res) {
        try {
            const {
                owner,
                shop_name,
                shop_bank_account,
                shop_bank_account_number,
            } = req.body;

            if (!owner || !shop_name || !shop_bank_account || !shop_bank_account_number) {
                throw new Error("All fields are required: owner, shop_name, shop_bank_account, shop_bank_account_number");
            }

            const result = await this.shopRepo.createShop({
                owner,
                shop_name,
                shop_bank_account,
                shop_bank_account_number,
            });

            res.status(200).json({ message: "Shop created successfully", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async deleteShop(req, res) {
        try {
            const { shop_id, owner } = req.body;

            if (!shop_id || !owner) {
                throw new Error("shop_id and owner are required");
            }

            const result = await this.shopRepo.deleteShop({ shop_id, owner });
            res.status(200).json({ message: "Shop deleted successfully", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async updateShopBankInfo(req, res) {
        try {
            const {
                shop_id,
                owner,
                shop_bank_account,
                shop_bank_account_number,
            } = req.body;

            if (!shop_id || !owner) {
                throw new Error("shop_id and owner are required");
            }

            const result = await this.shopRepo.updateShopBankInfo({
                shop_id,
                owner,
                shop_bank_account,
                shop_bank_account_number,
            });

            res.status(200).json({ message: "Shop bank info updated successfully", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async getShopsByOwner(req, res) {
        try {
            const { owner, page, limit } = req.body;

            if (!owner) {
                throw new Error("owner is required");
            }

            const result = await this.shopRepo.getShopsByOwner({ owner, page, limit });
            res.status(200).json({ message: "OK", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async getShopById(req, res) {
        try {
            const { shop_id } = req.body;

            if (!shop_id) {
                throw new Error("shop_id is required");
            }

            const result = await this.shopRepo.getShopById({ shop_id });
            res.status(200).json({ message: "OK", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async updateShopInfo(req, res) {
        try {
            const {
                shop_id,
                owner,
                shop_name,
                shop_img,
            } = req.body;

            if (!shop_id || !owner) {
                throw new Error("shop_id and owner are required");
            }

            const result = await this.shopRepo.updateShopInfo({
                shop_id,
                owner,
                shop_name,
                shop_img,
            });

            res.status(200).json({ message: "Shop info updated successfully", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async createProfile(req, res) {
        try {
            const { email, name, profile_img } = req.body;

            if (!email) {
                throw new Error("email is required");
            }

            const result = await this.shopRepo.createProfile({ email, name, profile_img });
            res.status(200).json({ message: "OK", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                throw new Error("email is required");
            }

            const result = await this.shopRepo.getProfile({ email });
            res.status(200).json({ message: "OK", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { email, name, profile_img } = req.body;

            if (!email) {
                throw new Error("email is required");
            }

            const result = await this.shopRepo.updateProfile({ email, name, profile_img });
            res.status(200).json({ message: "OK", result });
        }
        catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    }
}
