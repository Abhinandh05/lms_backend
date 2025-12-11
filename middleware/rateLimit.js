import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const createRateLimiter = (options) =>
    rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: {
            success: false,
            message: options.message || "Too many requests. Please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            // Use user ID if authenticated, else use IP address with proper IPv6 handling
            if (req.user?.id) return `user:${req.user.id}`;
            return `ip:${ipKeyGenerator(req)}`;
        },
        skipFailedRequests: false,
        skipSuccessfulRequests: false,
    });

export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5, // Max 5 requests in 15 mins
    message: "Too many login/register attempts. Try again after 15 minutes.",
});

export const editLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Allow 10 edits per 10 minutes
    message: "Too many edits. Please wait before trying again.",
});

export const globalLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 req/min
    message: "Too many requests from this IP. Please slow down.",
});