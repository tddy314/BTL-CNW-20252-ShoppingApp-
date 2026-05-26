import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:3001";

export class CallCart {
    async addItemToCart(
        email,
        shop,
        productDetail
    ) {
        try {
            const res = await axios.post(`${CART_SERVICE_URL}/cart-service/add-item-to-cart`, {      
                email,
                shop,
                productDetail
            });
        } 
        catch (err) {
            console.log(err);
        }
    }


    async removeItemFromCart(
        email,
        cartItemId
    ) {
        try {
            const res = await axios.post(`${CART_SERVICE_URL}/cart-service/remove-item-from-cart`, {      
                email,
                cartItemId
            });
        } 
        catch (err) {
            console.log(err);
        }
    }

    
    async readCart(email, page, limit, sortBy = "latest", category = "all") {
    try {
        const res = await axios.post(`${CART_SERVICE_URL}/cart-service/get-cart`, {      
            email,
            page,
            limit,
            sortBy,
            category
        });
        //console.log("Response:", res.data);
        //console.log(res.data.result.items)
        return res.data.result;
    } catch (err) {
        console.log(err);
    }
}

}
