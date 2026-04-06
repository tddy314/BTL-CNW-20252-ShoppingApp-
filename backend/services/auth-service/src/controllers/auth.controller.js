import { AuthServiceRepository } from "../repository/auth.repo.js";

export class AuthController {
    authRepo;
    constructor() {
        this.authRepo = new AuthServiceRepository();
    }
    async signUp(req, res) {
        try {
            const {
                email,
                password
            } = req.body;
            if(!email || !password) throw new Error("No data found");
            const data = await this.authRepo.signUp(email, password);
            res.status(200).json({message: "Sucess sign up", data});
        } 
        catch(error) {
            res.status(500).json({message: "Error: " + error.message});
        }
    }

    async signUpAsAdmin(req, res) {
        try {
            const {
                email,
                password
            } = req.body;
            if(!email || !password) throw new Error("No data found");
            const data = await this.authRepo.signUp(email, password);
            res.status(200).json({message: "Sucess sign up", data});
        } 
        catch(error) {
            res.status(500).json({message: "Error: " + error.message});
        }
    }

    async signIn(req, res) {
        try {
            const {
                email,
                password
            } = req.body;
            if(!email || !password) throw new Error("No data found");

            const result = await this.authRepo.signIn(email, password);

            const payload = {
                userId: result.user.id,
                email: result.user.email,
                role: result.user.user_metadata.role 
            };

            return res.status(200).json({
                message: "Login OK!",
                data: {
                    payload,
                    token: result.session.access_token // Sửa lỗi cú pháp chỗ này
                }
            });
        } 
        catch(error) {
            res.status(500).json({message: "Error: " + error.message});
        }
    }
}