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
                password,
                emailRedirectTo,
            } = req.body;
            if(!email || !password) throw new Error("No data found");
            const redirectTo = emailRedirectTo || process.env.EMAIL_REDIRECT_TO;
            const data = await this.authRepo.signUp(email, password, redirectTo);
            res.status(200).json({
                message: "Sign up successful. Please check your email to verify your account.",
                data
            });
        } 
        catch(error) {
            const isDuplicate = String(error.message || "").includes("Email already registered");
            res.status(isDuplicate ? 409 : 500).json({message: "Error: " + error.message});
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
            const isDuplicate = String(error.message || "").includes("Email already registered");
            res.status(isDuplicate ? 409 : 500).json({message: "Error: " + error.message});
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
            if (!result?.session?.access_token || !result?.user) {
                throw new Error("Unable to sign in");
            }

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
            const message = String(error.message || "");
            const isUnverified = message.toLowerCase().includes("email not confirmed");
            const isInvalidCredentials = message.toLowerCase().includes("invalid login credentials");
            const status = isUnverified ? 403 : (isInvalidCredentials ? 401 : 500);
            res.status(status).json({message: "Error: " + message});
        }
    }

    async forgotPassword(req, res) {
        try {
            const {
                email,
                redirectTo,
            } = req.body;

            if(!email) throw new Error("email is required");

            await this.authRepo.forgotPassword(email, redirectTo);
            return res.status(200).json({ message: "Reset password email sent" });
        }
        catch(error) {
            res.status(400).json({message: "Error: " + error.message});
        }
    }

    async refreshPassword(req, res) {
        try {
            const {
                accessToken,
                newPassword,
            } = req.body;

            if(!accessToken || !newPassword) {
                throw new Error("accessToken and newPassword are required");
            }

            const result = await this.authRepo.refreshPassword(accessToken, newPassword);
            return res.status(200).json({ message: "Password updated", data: result });
        }
        catch(error) {
            res.status(400).json({message: "Error: " + error.message});
        }
    }

    async sendEmailOtp(req, res) {
        try {
            const { email } = req.body;
            if(!email) {
                throw new Error("email is required");
            }

            await this.authRepo.sendEmailOtp(email);
            return res.status(200).json({ message: "OTP sent to email" });
        }
        catch(error) {
            return res.status(400).json({message: "Error: " + error.message});
        }
    }

    async verifyEmailOtp(req, res) {
        try {
            const { email, token } = req.body;
            if(!email || !token) {
                throw new Error("email and token are required");
            }

            const result = await this.authRepo.verifyEmailOtp(email, token);
            return res.status(200).json({
                message: "OTP verified",
                data: result,
            });
        }
        catch(error) {
            return res.status(400).json({message: "Error: " + error.message});
        }
    }

    async verifyEmailLink(req, res) {
        try {
            const { tokenHash, type } = req.body;
            if(!tokenHash) {
                throw new Error("tokenHash is required");
            }

            const result = await this.authRepo.verifyEmailLink(tokenHash, type || "signup");
            return res.status(200).json({
                message: "Email link verified",
                data: result,
            });
        }
        catch(error) {
            return res.status(400).json({message: "Error: " + error.message});
        }
    }
}
