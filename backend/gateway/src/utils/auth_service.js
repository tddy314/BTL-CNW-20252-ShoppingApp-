import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.AUTH_SERVICE_URL;

export class CallAuth {
    async signIn(email, password) {
        console.log("sign in calling" + URL);
        try {
            
            const res = await axios.post(`${URL}/auth-service/sign-in`, {
                email,
                password
            })
            console.log(res.data)
            return {
                payload: res.data.data.payload,
                token: res.data.data.token
            }
        }
        catch(error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async signUp(email, password) {
        console.log("sign up calling" + URL);
        try {
            const res = await axios.post(`${URL}/auth-service/sign-up`, {
                email,
                password
            })
            console.log(res.data)
            return res.data
        }
        catch(error) {
            console.log(error);
            throw new Error(error.message);
        }
    }
}