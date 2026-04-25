import axios from "axios";

const GATEWAY_URL = process.env.API_GATEWAY_URL;
const GATEWAY_BASE_URL = GATEWAY_URL || "http://localhost:8080";


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
}