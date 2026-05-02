
import axios from "axios";

async function testNewOrder() {
    try {
        const res = await axios.post("http://localhost:3002/order-service/new-order", {      
            product_id: "dfba0a83-0e0c-44a2-8340-dd7d23da2ac1",
            buyer: "user@gmail.com",
            payment: 0,
            price: 15,
            phone: "1445787",
            address: "Hn",
            receiver: "fdfrtrf",
            seller: "dfdf",
            shop_id: "67586e6e-3719-4353-b335-dbbc2e8892fc"
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}
//testNewOrder();

async function testModifyOrder() {
    try {
        const res = await axios.patch("http://localhost:3002/order-service/modify-order", {      
            order_id: "7766e3fa-78c8-4278-9fff-e7fc5229cb33",
            buyer: "user@gmail.com",
            phone: "1111111",
            address: "hello",
            receiver: "sdsddf"
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}

testModifyOrder();