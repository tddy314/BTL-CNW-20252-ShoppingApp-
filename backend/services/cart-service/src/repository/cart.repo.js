import redisClient from '../config/database/redis.config.js'
import crypto from "crypto";

export class CartRepo {
    async addProductToCart(email, shop, productDetail) {
        await redisClient.rPush(
            `${email}`,
            JSON.stringify({
                cartItemId: crypto.randomUUID(),
                addedAt: new Date().toISOString(),
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

    async getCart(email, page, limit = 5, sortBy = "latest", category = "all") {
        if(limit < 5) {
            throw new Error("A page must contain at least 5 item!")
        }
        if(limit > 20) {
            throw new Error("A page must not contain more than 20 item!")
        }
        const cartKey = `${email}`;
        const cartItems = await redisClient.lRange(cartKey, 0, -1);
        const parsedItems = cartItems.map(item => JSON.parse(item));

        const normalizedCategory = String(category || "all").toLowerCase();
        const filteredItems = normalizedCategory === "all"
            ? parsedItems
            : parsedItems.filter((item) => {
                const itemCategory = String(item?.productDetail?.category || "").toLowerCase();
                return itemCategory === normalizedCategory;
            });

        const sortedItems = [...filteredItems];
        sortedItems.sort((a, b) => {
            const aPrice = Number(a?.productDetail?.price || 0);
            const bPrice = Number(b?.productDetail?.price || 0);
            const aAddedAt = new Date(a?.addedAt || 0).getTime();
            const bAddedAt = new Date(b?.addedAt || 0).getTime();

            switch(sortBy) {
                case "oldest":
                    return aAddedAt - bAddedAt;
                case "price-asc":
                    return aPrice - bPrice;
                case "price-desc":
                    return bPrice - aPrice;
                case "latest":
                default:
                    return bAddedAt - aAddedAt;
            }
        });

        const totalItems = sortedItems.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const safePage = Math.min(Math.max(1, Number(page)), totalPages);
        const start = (safePage - 1) * limit;
        const end = start + limit;
        const items = sortedItems.slice(start, end);

        return {
            currentPage: safePage,
            limit,
            totalItems,
            totalPages,
            items
        };
    }
}
