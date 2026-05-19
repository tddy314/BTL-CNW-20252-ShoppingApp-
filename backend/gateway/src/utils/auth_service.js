import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.AUTH_SERVICE_URL;
function buildError(error) {
    const message = error?.response?.data?.message || error?.message || "Unknown error";
    const wrapped = new Error(message);
    wrapped.status = error?.response?.status || 500;
    return wrapped;
}

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
            throw buildError(error);
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
            throw buildError(error);
        }
    }

    async forgotPassword(email, redirectTo) {
        try {
            const res = await axios.post(`${URL}/auth-service/forgot-password`, {
                email,
                redirectTo,
            });
            return res.data;
        }
        catch (error) {
            throw buildError(error);
        }
    }

    async refreshPassword(accessToken, newPassword) {
        try {
            const res = await axios.post(`${URL}/auth-service/refresh-password`, {
                accessToken,
                newPassword,
            });
            return res.data;
        }
        catch (error) {
            throw buildError(error);
        }
    }

    async verifyEmailLink(tokenHash, type = "signup") {
        try {
            const res = await axios.post(`${URL}/auth-service/verify-email-link`, {
                tokenHash,
                type,
            });
            return res.data;
        }
        catch (error) {
            throw buildError(error);
        }
    }
}
