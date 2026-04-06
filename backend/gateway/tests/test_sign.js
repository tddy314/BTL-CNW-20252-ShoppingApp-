import axios from "axios";


async function test_sign_up() {
    try {
        const res = await axios.post("http://localhost:8080/api-gate/auth-service/sign-up", {      
            email: "gojousatoru@gmail.com",
            password: "123456789"
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}

async function test_sign_in() {
    try {
        const res = await axios.post("http://localhost:8080/api-gate/auth-service/sign-in", {      
            email: "gojousatoru@gmail.com",
            password: "123456789"
        });
        console.log("Response:", res.data.data);
    } catch (err) {
        console.log(err);
    }
}

//test_sign_up();
test_sign_in();