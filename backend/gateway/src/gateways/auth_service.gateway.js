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
            return res.status(error.status || 500).json({message: "Error: " + error.message});
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
            return res.status(error.status || 500).json({message: "Error: " + error.message});
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email, redirectTo } = req.body;
            if (!email) throw new Error("email is required");
            const result = await this.auth_service.forgotPassword(email, redirectTo);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(error.status || 500).json({message: "Error: " + error.message});
        }
    }

    async refreshPassword(req, res) {
        try {
            const { accessToken, newPassword } = req.body;
            if (!accessToken || !newPassword) {
                throw new Error("accessToken and newPassword are required");
            }
            const result = await this.auth_service.refreshPassword(accessToken, newPassword);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(error.status || 500).json({message: "Error: " + error.message});
        }
    }

    async verifyEmailLink(req, res) {
        try {
            const { tokenHash, type } = req.body;
            if (!tokenHash) {
                throw new Error("tokenHash is required");
            }
            const result = await this.auth_service.verifyEmailLink(tokenHash, type || "signup");
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(error.status || 500).json({message: "Error: " + error.message});
        }
    }
}
