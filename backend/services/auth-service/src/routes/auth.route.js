import { AuthController } from "../controllers/auth.controller.js";
import express from "express"

export const router = express.Router();
const controller = new AuthController();


router.post('/sign-up', controller.signUp.bind(controller));
router.post('/sign-in', controller.signIn.bind(controller));