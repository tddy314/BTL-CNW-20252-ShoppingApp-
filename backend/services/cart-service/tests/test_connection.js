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
            email: "123@gmail.com",
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
            email: "123@gmail.com",
            page: 1,
            limit: 5
        });
        console.log("Response:", res.data);
        console.log(res.data.result.items)
    } catch (err) {
        console.log(err);
    }
}


//removeFromCart('1b9ef188-353c-4dc6-8d2f-bbcff7071dde')
//addToCart();
//readCart();