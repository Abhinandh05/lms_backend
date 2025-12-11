export const createArcjetMiddleware = (protection) => {
    return async (req, res, next) => {
        // Skip if Arcjet is not configured
        if (!protection) {
            return next();
        }

        // Bypass Arcjet protection in non-production environments or when running on localhost
        // This makes local development and automated testing possible without being blocked by the
        // protection service. In production, protection remains enabled.
        const isLocalHost = req.hostname === 'localhost' || req.hostname === '127.0.0.1' || req.ip === '::1' || (req.ip && req.ip.startsWith && req.ip.startsWith('127.'));
        if (process.env.NODE_ENV !== 'production' || isLocalHost || process.env.DISABLE_ARCJET === '1') {
            return next();
        }
        try {

            const email = req.body.email?.trim().toLowerCase();


            const userId = req.id || req.user?.id;

            // Build characteristics dynamically
            const characteristics = {};

            if (email) {
                characteristics.email = email;
            }

            if (userId) {
                characteristics.userId = String(userId);
            }


            const decision = await protection.protect(req, characteristics);


            console.log("Arcjet Decision:", {
                conclusion: decision.conclusion,
                reason: decision.reason?.type || "allowed",
                ip: decision.ip,
                email: email || "N/A",
                userId: userId || "N/A",
                ruleResults: decision.results?.map(r => ({
                    rule: r.ruleId,
                    conclusion: r.conclusion,
                    reason: r.reason?.type
                })),
                timestamp: new Date().toISOString()
            });

            // Store decision in request
            req.arcjetDecision = decision;

            // Handle denials
            if (decision.isDenied()) {
                // Rate limit exceeded
                if (decision.reason.isRateLimit()) {
                    const resetTime = decision.reason.resetTime
                        ? new Date(decision.reason.resetTime).toISOString()
                        : "soon";

                    const waitTime = decision.reason.resetTime
                        ? Math.ceil((decision.reason.resetTime - Date.now()) / 1000)
                        : 900;

                    // Determine which limit was hit (email or IP)
                    const limitType = decision.results?.find(r =>
                        r.conclusion === "DENY" && r.reason?.isRateLimit?.()
                    );

                    const isIpLimit = limitType?.reason?.characteristics?.includes("ip.src");
                    const isEmailLimit = limitType?.reason?.characteristics?.includes("email");

                    // Add rate limit headers
                    res.setHeader('X-RateLimit-Limit', decision.reason.max || '5');
                    res.setHeader('X-RateLimit-Remaining', '0');
                    res.setHeader('X-RateLimit-Reset', resetTime);
                    res.setHeader('Retry-After', waitTime);

                    // Provide specific error messages
                    let message;
                    if (isEmailLimit && email) {
                        message = `Too many attempts for ${email}. Please try again later.`;
                    } else if (isIpLimit) {
                        message = 'Too many attempts from your location. Please try again later.';
                    } else {
                        message = 'Too many attempts. Please try again later.';
                    }

                    return res.status(429).json({
                        success: false,
                        message,
                        retryAfter: resetTime,
                        waitTimeSeconds: waitTime,
                        type: "RATE_LIMIT",
                        limitType: isIpLimit ? "IP" : isEmailLimit ? "EMAIL" : "GENERAL"
                    });
                }

                // Bot detected
                if (decision.reason.isBot()) {
                    return res.status(403).json({
                        success: false,
                        message: "Automated requests are not allowed.",
                        type: "BOT_DETECTED"
                    });
                }

                // Shield protection triggered
                if (decision.reason.isShield()) {
                    return res.status(403).json({
                        success: false,
                        message: "Request blocked by security rules.",
                        type: "SECURITY_VIOLATION"
                    });
                }

                // Generic denial
                return res.status(403).json({
                    success: false,
                    message: "Request denied.",
                    type: "ACCESS_DENIED"
                });
            }

            // Add rate limit info to response headers even on success
            if (decision.reason && 'remaining' in decision.reason) {
                res.setHeader('X-RateLimit-Limit', decision.reason.max || '5');
                res.setHeader('X-RateLimit-Remaining', decision.reason.remaining || '0');
            }

            next();
        } catch (error) {
            console.error("Arcjet middleware error:", error);

            // In production, fail open (allow request) but log the error
            if (process.env.ARCJET_ENV === 'production') {
                console.error("Arcjet error - failing open to avoid blocking legitimate users");
                next();
            } else {
                return res.status(500).json({
                    success: false,
                    message: "Security check failed",
                    error: error.message
                });
            }
        }
    };
};