import axios from "axios";

const GATEWAY_URL = process.env.API_GATEWAY_URL;
const GATEWAY_BASE_URL = GATEWAY_URL || "http://localhost:8080";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderRecord = {
    id: string;
    created_at: string;
    product_id: string;
    buyer: string;
    color: string | null;
    size: number | null;
    order_id: string;
    payment: 0 | 1;
    bank: string | null;
    bank_number: string | null;
    status: OrderStatus;
    price: number;
    phone: string;
    address: string;
    receiver: string;
    quantity: number;
    seller: string;
    shop_id: string;
};

export type PaginatedOrderResponse = {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    items: OrderRecord[];
};

export type ProductRecord = {
    id: number;
    created_at: string;
    product_id: string;
    shop_id: string;
    shop_owner: string;
    shop_name?: string;
    shop_img?: string | null;
    product_img_link: string | null;
    category: string;
    price: number;
    description: string;
    name: string;
    tag: string | null;
    tags: string[];
    colors_list: string | null;
    colors: string[];
    size_list: string | null;
    sizes: string[];
    material_list: string | null;
    materials: string[];
    sold_count: number;
};

export type PaginatedProductResponse = {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    items: ProductRecord[];
};

export type ProfileRecord = {
    id: number;
    created_at: string;
    profile_img: string | null;
    name: string;
    email: string;
};

export type ReviewRecord = {
    id: number;
    created_at: string;
    product_id: string;
    user_email: string;
    comment: string;
    rating: number;
};

export type PaginatedReviewResponse = {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    items: ReviewRecord[];
};

export type NewOrderPayload = {
    product_id: string;
    buyer: string;
    color?: string | null;
    size?: number | null;
    payment: 0 | 1;
    bank?: string | null;
    bank_number?: string | null;
    price: number;
    phone: string;
    address: string;
    receiver: string;
    quantity: number;
    seller: string;
    shop_id: string;
};

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hash32(input: string, seed: number): string {
    let hash = seed >>> 0;

    for(let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
    }

    return hash.toString(16).padStart(8, "0");
}

export function normalizeIdentifierToUuid(value: string): string {
    const normalized = value.trim().toLowerCase();

    if(isUuid(normalized)) {
        return normalized;
    }

    const h1 = hash32(normalized, 0x811c9dc5);
    const h2 = hash32(normalized + "-a", 0x01000193);
    const h3 = hash32(normalized + "-b", 0x9e3779b1);
    const h4 = hash32(normalized + "-c", 0x85ebca6b);
    const hex = `${h1}${h2}${h3}${h4}`.slice(0, 32);

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}


export class ApiGateway {
    async signIn(
        email: string,
        password: string
    ) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/auth-service/sign-in`, {
                email,
                password
            });
            console.log(res.data.data)
            return res.data.data;
        }
        catch(error: any) {
            throw new Error("Error: " + error);
        }
    }

    async signUp(
        email: string,
        password: string
    ) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/auth-service/sign-up`, {
                email,
                password
            });
            console.log(res.data.data)
            return res.data.data;
        }
        catch(error: any) {
            throw new Error("Error: " + error);
        }
    }

    async addItemToCart(
        email: string,
        shop: Record<string, unknown>,
        product: Record<string, unknown>
    ) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/cart-service/add-item-to-cart`, {
                email,
                shop,
                product
            });

            return res.data;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to add item to cart");
        }
    }

    async readCart(
        email: string,
        page: number,
        limit: number
    ) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/cart-service/read-cart`, {
                email,
                page,
                limit
            });

            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to read cart");
        }
    }

    async  removeItemFromCart(
        email: string,
        cartItemId: string
    ) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/cart-service/remove-item-from-cart`, {
                email,
                cartItemId
            });

            return res.data;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to remove item from cart");
        }
    }

    async newOrder(payload: NewOrderPayload) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/order-service/new-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to create order");
        }
    }

    async modifyOrder(payload: {
        order_id: string;
        buyer: string;
        phone?: string;
        address?: string;
        receiver?: string;
    }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/order-service/modify-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to modify order");
        }
    }

    async cancelOrder(payload: { order_id: string; buyer: string; }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/order-service/cancel-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to cancel order");
        }
    }

    async sellerAcceptOrder(payload: { order_id: string; seller: string; }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/order-service/seller-accept-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to accept order");
        }
    }

    async sellerRejectOrder(payload: { order_id: string; seller: string; }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/order-service/seller-reject-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to reject order");
        }
    }

    async adminShipOrder(payload: { order_id: string; }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/order-service/admin-ship-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to ship order");
        }
    }

    async adminDeliverOrder(payload: { order_id: string; }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/order-service/admin-deliver-order`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to deliver order");
        }
    }

    async readOrdersByBuyer(payload: { buyer: string; page: number; limit: number; }): Promise<PaginatedOrderResponse> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/order-service/read-orders-by-buyer`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to read buyer orders");
        }
    }

    async readOrdersByShop(payload: { shop_id: string; page: number; limit: number; }): Promise<PaginatedOrderResponse> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/order-service/read-orders-by-shop`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to read shop orders");
        }
    }

    async readAllOrders(payload: { page: number; limit: number; }): Promise<PaginatedOrderResponse> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/order-service/read-all-orders`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to read orders");
        }
    }

    // ========== SHOP / INVENTORY SERVICE ==========

    async createShop(payload: {
        owner: string;
        shop_name: string;
        shop_bank_account: string;
        shop_bank_account_number: string;
    }) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/inventory-service/create-shop`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to create shop");
        }
    }

    async deleteShop(payload: { shop_id: number; owner: string; }) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/inventory-service/delete-shop`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to delete shop");
        }
    }

    async updateShopBankInfo(payload: {
        shop_id: number;
        owner: string;
        shop_bank_account?: string;
        shop_bank_account_number?: string;
    }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/inventory-service/update-shop-bank-info`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to update shop bank info");
        }
    }

    async getShopsByOwner(payload: { owner: string; page: number; limit: number; }) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/inventory-service/get-shops-by-owner`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get shops");
        }
    }

    async getShopById(payload: { shop_id: number; }) {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/inventory-service/get-shop-by-id`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get shop");
        }
    }

    async createProfile(payload: { email: string; name?: string; profile_img?: string | null; }): Promise<ProfileRecord> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/inventory-service/create-profile`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to create profile");
        }
    }

    async updateShopInfo(payload: {
        shop_id: number;
        owner: string;
        shop_name?: string;
        shop_img?: string | null;
    }) {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/inventory-service/update-shop-info`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to update shop info");
        }
    }

    async getProfile(payload: { email: string; }): Promise<ProfileRecord> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/inventory-service/get-profile`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get profile");
        }
    }

    async updateProfile(payload: { email: string; name?: string; profile_img?: string | null; }): Promise<ProfileRecord> {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/inventory-service/update-profile`, payload);
            return res.data?.result;
        }
        catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to update profile");
        }
    }

    // ========== PRODUCT SERVICE ==========

    async addProduct(payload: {
        shop_id: string;
        shop_owner: string;
        product_img_link?: string | null;
        category: string;
        price: number;
        description: string;
        name: string;
        tag?: string | null;
        colors_list?: string | null;
        size_list?: string | null;
        material_list?: string | null;
    }): Promise<ProductRecord> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/product-service/add-product`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to add product");
        }
    }

    async updateProduct(payload: {
        product_id: string;
        shop_owner: string;
        product_img_link?: string | null;
        category?: string;
        price?: number;
        description?: string;
        name?: string;
        tag?: string | null;
        colors_list?: string | null;
        size_list?: string | null;
        material_list?: string | null;
    }): Promise<ProductRecord> {
        try {
            const res = await axios.patch(`${GATEWAY_BASE_URL}/api-gate/product-service/update-product`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to update product");
        }
    }

    async deleteProduct(payload: { product_id: string; shop_owner: string; }): Promise<ProductRecord> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/product-service/delete-product`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to delete product");
        }
    }

    async getProductById(payload: { product_id: string; }): Promise<ProductRecord> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/product-service/get-product-by-id`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get product");
        }
    }

    async searchProducts(payload: {
        page?: number;
        limit?: number;
        query?: string;
        category?: string;
        shop_id?: string;
        shop_owner?: string;
        min_price?: number;
        max_price?: number;
    }): Promise<PaginatedProductResponse> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/product-service/search-products`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to search products");
        }
    }

    // ========== REVIEW SERVICE ==========

    async addReview(payload: {
        product_id: string;
        user_email: string;
        comment: string;
        rating: number;
    }): Promise<ReviewRecord> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/review-service/add-review`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to add review");
        }
    }

    async getReviewsByProduct(payload: { product_id: string; page?: number; limit?: number; }): Promise<PaginatedReviewResponse> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/review-service/get-reviews-by-product`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get reviews");
        }
    }

    async getProductRating(payload: { product_id: string; }): Promise<{ product_id: string; average_rating: number; total_reviews: number; }> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/review-service/get-product-rating`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get product rating");
        }
    }

    async getShopRating(payload: { shop_id: string; }): Promise<{ shop_id: string; average_rating: number; total_reviews: number; }> {
        try {
            const res = await axios.post(`${GATEWAY_BASE_URL}/api-gate/review-service/get-shop-rating`, payload);
            return res.data?.result;
        } catch(error: any) {
            throw new Error(error?.response?.data?.message || "Failed to get shop rating");
        }
    }
}
