import arcjet, { detectBot, shield, slidingWindow, tokenBucket } from "@arcjet/node";

// Check if Arcjet is enabled
const isArcjetEnabled = !!process.env.ARCJET_KEY;
const isDevelopment = process.env.ARCJET_ENV !== 'production';

// Base Arcjet instance - only if key is provided
export const aj = isArcjetEnabled ? arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
    ],
}) : null;

// Registration protection - Dual layer (IP + prevents duplicate emails)
export const registrationProtection = isArcjetEnabled ? aj.withRule(
    detectBot({
        mode: "LIVE",
        allow: isDevelopment ? [
            "POSTMAN",
            "CURL",
            "INSOMNIA",
            "HTTPIE"
        ] : []
    }),

    slidingWindow({
        mode: "LIVE",
        interval: "1h",
        max: 10, // Allow 10 registrations per hour per IP
        characteristics: ["ip.src"]
    })
) : null;

// Login protection - DUAL TRACKING
export const loginProtection = isArcjetEnabled ? aj.withRule(
    detectBot({
        mode: "LIVE",
        allow: isDevelopment ? [
            "CATEGORY:SEARCH_ENGINE",
            "POSTMAN",
            "CURL",
            "INSOMNIA",
            "HTTPIE"
        ] : ["CATEGORY:SEARCH_ENGINE"]
    }),
    // Layer 1: Per-email limit
    slidingWindow({
        mode: "LIVE",
        interval: "15m",
        max: 5,
        characteristics: ["email"]
    }),
    // Layer 2 Per-IP limit
    slidingWindow({
        mode: "LIVE",
        interval: "15m",
        max: 20,
        characteristics: ["ip.src"]
    })
) : null;

// OTP protection - DUAL TRACKING (UserId + IP)
export const otpProtection = isArcjetEnabled ? aj.withRule(
    detectBot({
        mode: "LIVE",
        allow: isDevelopment ? [
            "POSTMAN",
            "CURL",
            "INSOMNIA"
        ] : []
    }),
    // Layer 1: Per-user limit
    tokenBucket({
        mode: "LIVE",
        refillRate: 1,
        interval: "15m",
        capacity: 5,
        characteristics: ["userId"]
    }),

    tokenBucket({
        mode: "LIVE",
        refillRate: 2,
        interval: "15m",
        capacity: 15,
        characteristics: ["ip.src"]
    })
) : null;


export const passwordResetProtection = isArcjetEnabled ? aj.withRule(
    detectBot({
        mode: "LIVE",
        allow: isDevelopment ? [
            "POSTMAN",
            "CURL",
            "INSOMNIA"
        ] : []
    }),

    slidingWindow({
        mode: "LIVE",
        interval: "1h",
        max: 3,
        characteristics: ["email"]
    }),

    slidingWindow({
        mode: "LIVE",
        interval: "1h",
        max: 15,
        characteristics: ["ip.src"]
    })
) : null;


export const apiProtection = isArcjetEnabled ? aj.withRule(
    detectBot({
        mode: "LIVE",
        allow: [
            "CATEGORY:SEARCH_ENGINE",
            "CATEGORY:MONITOR",
        ],
    }),
    tokenBucket({
        mode: "LIVE",
        refillRate: 10,
        interval: "10s",
        capacity: 100,
        characteristics: ["userId"]
    }),

    tokenBucket({
        mode: "LIVE",
        refillRate: 20,
        interval: "10s",
        capacity: 200,
        characteristics: ["ip.src"]
    })
) : null;