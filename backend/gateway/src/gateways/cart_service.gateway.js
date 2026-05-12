import { CallCart } from "../utils/cart_service.js";


export class CartGateWay {
    cart_service
    constructor() {
        this.cart_service = new CallCart();
    }
    async addItemToCart(req, res) {
        try {
            const {
                email,
                shop,
                product
            } = req.body;
            if(!email || !shop || !product) {
                throw new Error("No information found");
            }
            await this.cart_service.addItemToCart(email, shop, product);
            res.status(200).json({message: "Ok"});
        }
        catch(error) {
            return res.status(500).json({message: "Error: " + error.message});
        }
    }
    async removeItemFromCart(req, res) {
        try {
            const {
                email,
                cartItemId
            } = req.body;
            if(!email || !cartItemId) {
                throw new Error("No information found");
            }
            await this.cart_service.removeItemFromCart(email, cartItemId);
            res.status(200).json({message: "Ok"});
        }
        catch(error) {
            return res.status(500).json({message: "Error: " + error.message});
        }
    }
    async readCart(req, res) {
        try {
            const {
                email,
                page, 
                limit,
                sortBy,
                category
            } = req.body;
            const result = await this.cart_service.readCart(email, page, limit, sortBy, category);
            return res.status(200).json({message: "Ok", result});
        }
        catch(error) {
            res.status(500).json({message: "Error: " + error.message})
        }
    }
}
