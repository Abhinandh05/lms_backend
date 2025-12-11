import { tokenBucket } from "@arcjet/node";
import os from "os";
import { aj } from "../config/arcjet.js";

export const adaptiveRateLimitMiddleware = async (req, res, next) => {
    try {
        // Bypass Arcjet protection in non-production environments
        if (process.env.NODE_ENV !== 'production') {
            return next();
        }

        // Get system load
        const loadAverage = os.loadavg()[0]; // 1-minute load average
        const cpuCount = os.cpus().length;
        const loadPercentage = (loadAverage / cpuCount) * 100;

        // Determine rate limit based on load
        let refillRate, capacity;

        if (loadPercentage > 80) {
            // High load - strict limits
            refillRate = 2;
            capacity = 10;
        } else if (loadPercentage > 50) {
            // Medium load - moderate limits
            refillRate = 5;
            capacity = 20;
        } else {
            // Low load - relaxed limits
            refillRate = 10;
            capacity = 50;
        }

        const adaptiveProtection = aj.withRule(
            tokenBucket({
                mode: "LIVE",
                refillRate,
                interval: "1m",
                capacity,
            })
        );

        const decision = await adaptiveProtection.protect(req);

        if (decision.isDenied()) {
            return res.status(503).json({
                success: false,
                message: "Service temporarily busy. Please try again in a moment.",
                retryAfter: 60,
            });
        }

        next();
    } catch (error) {
        console.error("Adaptive rate limit error:", error);
        next();
    }
};