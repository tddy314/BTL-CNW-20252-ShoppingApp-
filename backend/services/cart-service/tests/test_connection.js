import axios from "axios"

async function addToCart() {
    try {
        const res = await axios.post("http://localhost:3001/cart-service/add-item-to-cart", {      
            email: "123@gmail.com",
            shop: "id-1",
            productDetail: {
                size: 4,
                color: "blue"
            }
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}

async function removeFromCart(cartItemId) {
    try {
        const res = await axios.post("http://localhost:3001/cart-service/remove-item-from-cart", {      
            email: "admin1@gmail.com",
            cartItemId
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}

async function readCart() {
    try {
        const res = await axios.post("http://localhost:3001/cart-service/get-cart", {      
            email: "admin1@gmail.com",
            page: 1,
            limit: 5
        });
        console.log("Response:", res.data);
        console.log(res.data.result.items)
    } catch (err) {
        console.log(err);
    }
}


//removeFromCart('c3fddb12-bbf6-4bd0-8d79-b3b77ab727b7')
//addToCart();
readCart();