import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export class CallCart {
    async addItemToCart(
        email,
        shop,
        productDetail
    ) {
        try {
            const res = await axios.post("http://localhost:3001/cart-service/add-item-to-cart", {      
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
            const res = await axios.post("http://localhost:3001/cart-service/remove-item-from-cart", {      
                email,
                cartItemId
            });
        } 
        catch (err) {
            console.log(err);
        }
    }

    
    async readCart(email, page, limit) {
    try {
        const res = await axios.post("http://localhost:3001/cart-service/get-cart", {      
            email,
            page,
            limit
        });
        //console.log("Response:", res.data);
        //console.log(res.data.result.items)
        return res.data.result;
    } catch (err) {
        console.log(err);
    }
}

}