import express from "express";
import { CartGateWay } from "../gateways/cart_service.gateway.js";

export const router = express.Router();
const cartGate = new CartGateWay();

router.post('/add-item-to-cart', cartGate.addItemToCart.bind(cartGate));
router.post('/remove-item-from-cart', cartGate.removeItemFromCart.bind(cartGate));
router.post('/read-cart', cartGate.readCart.bind(cartGate));