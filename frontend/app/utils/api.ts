import axios from "axios";

const GATEWAY_URL = process.env.API_GATEWAY_URL;


export class ApiGateway {
    async signIn(
        email: string,
        password: string
    ) {
        try {
            const res = await axios.post(`http://localhost:8080/api-gate/auth-service/sign-in`, {      
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
            const res = await axios.post(`http://localhost:8080/api-gate/auth-service/sign-up`, {      
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
}