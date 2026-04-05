import { CallAuth } from "../utils/auth_service.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_KEY = process.env.JWT_KEY;


export class AuthGateWay {
    auth_service
    constructor() {
        this.auth_service = new CallAuth();
    }
    async signIn(req, res) {
        try {
            const {
                email,
                password,
            } = req.body;
            if(!email || !password) throw new Error("No data found");
            const result = await this.auth_service.signIn(email, password);
            //console.log(result)
            const payload = {
                userId: result.payload.userId,
                email: result.payload.email,
                role: result.payload.role,
                token: result.token
            };

            return res.status(200).json({
                message: "Login OK!",
                data: payload
            });
        }
        catch(error) {
            return res.status(500).json({message: "Error: " + error.message});
        }
    }
    async signUp(req, res) {
        try {
            const {
                email,
                password,
            } = req.body;
            if(!email || !password) throw new Error("No data found");
            const result = await this.auth_service.signUp(email, password);

            return res.status(200).json({
                message: "Signup OK!",
                data: result
            });
        }
        catch(error) {
            return res.status(500).json({message: "Error: " + error.message});
        }
    }
}