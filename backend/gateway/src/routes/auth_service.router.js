import express from "express";
import { AuthGateWay } from "../gateways/auth_service.gateway.js";

export const router = express.Router();
const authGate = new AuthGateWay();

router.post('/sign-up', authGate.signUp.bind(authGate));
router.post('/sign-in', authGate.signIn.bind(authGate));

