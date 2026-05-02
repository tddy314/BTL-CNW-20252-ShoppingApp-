import axios from "axios";

async function readCart() {
    try {
        const res = await axios.post("http://localhost:8080/api-gate/cart-service/read-cart", {      
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

async function removeFromCart(cartItemId) {
    try {
        const res = await axios.post("http://localhost:8080/api-gate/cart-service/remove-item-from-cart", {      
            email: "admin1@gmail.com",
            cartItemId
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}


await removeFromCart('35401e93-adab-42db-b90f-afd228ec7687');
await readCart();