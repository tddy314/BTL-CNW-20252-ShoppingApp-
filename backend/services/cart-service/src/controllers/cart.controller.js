import { CartRepo } from "../repository/cart.repo.js";

export class CartController {
    cartRepo;
    constructor() {
        this.cartRepo = new CartRepo();
    }

    async addItemToCart(req, res) {
        try {
            const {
                email, 
                shop,
                productDetail
            } = req.body;
            if(!email || !shop || !productDetail) {
                throw new Error("Nothing to add!");
            }
            await this.cartRepo.addProductToCart(email, shop, productDetail);
            res.status(200).json({message: "Successfull add item into cart"});
        }
        catch(error) {
            res.status(400).json({message: "Error: " + error.message});
        }
    }

    async removeItemFromCart(req, res) {
        try {
            const {
                email,
                cartItemId,
            } = req.body;
            if(!email || !cartItemId) {
                throw new Error("No information found!")
            }
            await this.cartRepo.removeCartItem(email, cartItemId);
            res.status(200).json({message: "Successful remove from cart"});
        }
        catch(error) {
            res.status(400).json({message: "Error: " + error.message});
        }
    }

    async readCart(req, res) {
        try {
            const {
                email,
                page, 
                limit
            } = req.body
            //console.log(email, page, limit);
            if(!email || !page || !limit) {
                throw new Error("No information found!");
            }
            const result = await this.cartRepo.getCart(email, page, limit);
            res.status(200).json({message: "OK", result});
        }
        catch(error) {
            res.status(400).json({message: "Error: " + error.message});
        }
    }
}