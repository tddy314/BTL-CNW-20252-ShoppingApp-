import redisClient from '../config/database/redis.config.js'
import crypto from "crypto";

export class CartRepo {
    async addProductToCart(email, shop, productDetail) {
        await redisClient.rPush(
            `${email}`,
            JSON.stringify({
                cartItemId: crypto.randomUUID(),
                shop,
                productDetail
            })
        );
    }

    async removeCartItem(email, cartItemId) {

        const cartKey = `${email}`;
        const cartItems = await redisClient.lRange(cartKey, 0, -1);

        const parsedItems = cartItems.map(item => JSON.parse(item));
        const updatedItems = parsedItems.filter(
            item => item.cartItemId !== cartItemId
        );

        await redisClient.del(cartKey);

        if (updatedItems.length > 0) {
            await redisClient.rPush(
                cartKey,
                updatedItems.map(item => JSON.stringify(item))
            );
        }

        return updatedItems;
    }

    async getCart(email, page, limit = 5) {
        if(limit < 5) {
            throw new Error("A page must contain at least 5 item!")
        }
        if(limit > 20) {
            throw new Error("A page must not contain more than 20 item!")
        }
        const cartKey = `${email}`;

        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const cartItems = await redisClient.lRange(
            cartKey,
            start,
            end
        );

        const parsedItems = cartItems.map(item => JSON.parse(item));

        const totalItems = await redisClient.lLen(cartKey);

        return {
            currentPage: page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            items: parsedItems
        };
    }
}