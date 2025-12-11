import express from 'express';
import {
    getUserProfile,
    login,
    logout,
    register,
    resetPassword,
    sendResetOtp,
    sendVerifyOtp,
    verifyEmail
} from "./user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
// import {authLimiter} from "../middleware/rateLimit.js";
import {createArcjetMiddleware} from "../middleware/arcjet.middleware.js";
import {loginProtection, otpProtection, passwordResetProtection, registrationProtection} from "../config/arcjet.js";
import {analyticsMiddleware, getAnalytics} from "../middleware/arcjet-analytics.js";
import {threatIntelligenceMiddleware} from "../middleware/threat-intelligence.js";
import {adaptiveRateLimitMiddleware} from "../middleware/adaptive-rate-limit.js";
import {dynamicRateLimitMiddleware} from "../middleware/arcjet-dynamic.js";


const router = express.Router();


router.use(threatIntelligenceMiddleware);
router.use(analyticsMiddleware);

// Public endpoints with adaptive rate limiting
router.route("/register").post(
    adaptiveRateLimitMiddleware,
    createArcjetMiddleware(registrationProtection),
    register
);

router.route("/login").post(
    adaptiveRateLimitMiddleware,
    createArcjetMiddleware(loginProtection),
    login
);

// Authenticated endpoints with dynamic rate limiting
router.route("/logout").post(
    isAuthenticated,
    dynamicRateLimitMiddleware,            // Higher limits for premium users
    logout
);

router.route("/profile").get(
    isAuthenticated,
    dynamicRateLimitMiddleware,            // Higher limits for premium users
    getUserProfile
);

// OTP endpoints (sensitive)
router.route("/verify-otp").post(
    isAuthenticated,
    createArcjetMiddleware(otpProtection),
    sendVerifyOtp
);

router.route("/verify-email").post(
    isAuthenticated,
    createArcjetMiddleware(otpProtection),
    verifyEmail
);

// Password reset endpoints
router.route("/reset-otp").post(
    createArcjetMiddleware(passwordResetProtection),
    sendResetOtp
);

router.route("/reset-password").post(
    createArcjetMiddleware(passwordResetProtection),
    resetPassword
);

// Analytics endpoint (admin only)
router.route("/analytics").get(
    isAuthenticated,
    getAnalytics
);

export default router;

