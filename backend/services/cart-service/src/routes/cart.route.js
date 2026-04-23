import { CartController } from "../controllers/cart.controller.js";
import express from "express";


export const router = express.Router();
const controller = new CartController();

router.post('/add-item-to-cart', controller.addItemToCart.bind(controller));
router.post('/remove-item-from-cart', controller.removeItemFromCart.bind(controller));
router.post('/get-cart',controller.readCart.bind(controller));

