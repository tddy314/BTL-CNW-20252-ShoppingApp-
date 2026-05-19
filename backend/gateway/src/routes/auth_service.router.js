import express from "express";
import { AuthGateWay } from "../gateways/auth_service.gateway.js";

export const router = express.Router();
const authGate = new AuthGateWay();

router.post('/sign-up', authGate.signUp.bind(authGate));
router.post('/sign-in', authGate.signIn.bind(authGate));
router.post('/forgot-password', authGate.forgotPassword.bind(authGate));
router.post('/refresh-password', authGate.refreshPassword.bind(authGate));
router.post('/verify-email-link', authGate.verifyEmailLink.bind(authGate));

