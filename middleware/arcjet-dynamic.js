import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [shield({ mode: "LIVE" })],
});

// Create different protection levels based on user type
export const getUserProtection = (userTier = "free") => {
    const limits = {
        free: { refillRate: 5, capacity: 20 },
        premium: { refillRate: 20, capacity: 100 },
        enterprise: { refillRate: 100, capacity: 500 },
    };

    const config = limits[userTier] || limits.free;

    return aj.withRule(
        detectBot({ mode: "LIVE", allow: [] }),
        tokenBucket({
            mode: "LIVE",
            refillRate: config.refillRate,
            interval: "1m",
            capacity: config.capacity,
        })
    );
};

// Usage in middleware
export const dynamicRateLimitMiddleware = async (req, res, next) => {
    try {
        // Bypass Arcjet protection in non-production environments
        if (process.env.NODE_ENV !== 'production') {
            return next();
        }

        const userTier = req.user?.tier || "free";
        const protection = getUserProtection(userTier);
        const decision = await protection.protect(req);

        if (decision.isDenied()) {
            return res.status(429).json({
                success: false,
                message: `Rate limit exceeded for ${userTier} tier. Upgrade for higher limits.`,
                tier: userTier,
            });
        }

        // Add rate limit info to response headers
        res.setHeader("X-RateLimit-Tier", userTier);
        res.setHeader("X-RateLimit-Remaining", decision.reason?.remaining || "N/A");

        next();
    } catch (error) {
        console.error("Dynamic rate limit error:", error);
        next();
    }
};