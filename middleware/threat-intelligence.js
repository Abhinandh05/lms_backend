import { aj } from "../config/arcjet.js";

const knownBadIPs = new Set();
const knownBadUserAgents = new Set();

// Implement the threat database fetching function
const fetchThreatsFromDatabase = async () => {
    // Option 1: Return empty arrays initially (safe default)
    return {
        ips: [],
        userAgents: []
    };

    // Option 2: Fetch from your actual database
    // import db from "../config/database.js";
    // const threats = await db.threats.find({ active: true });
    // return {
    //     ips: threats.filter(t => t.type === 'ip').map(t => t.value),
    //     userAgents: threats.filter(t => t.type === 'user-agent').map(t => t.value)
    // };

    // Option 3: Fetch from external API
    // const response = await fetch('https://your-threat-feed.com/api/threats');
    // return await response.json();
};

export const updateThreatIntelligence = async () => {
    try {
        const threats = await fetchThreatsFromDatabase();

        // Clear and update the sets
        knownBadIPs.clear();
        knownBadUserAgents.clear();

        threats.ips.forEach((ip) => knownBadIPs.add(ip));
        threats.userAgents.forEach((ua) => knownBadUserAgents.add(ua));

        console.log("Threat intelligence updated:", {
            ips: knownBadIPs.size,
            userAgents: knownBadUserAgents.size,
        });
    } catch (error) {
        console.error("Failed to update threat intelligence:", error);
    }
};

// Initial update on startup
updateThreatIntelligence();

// Update every hour
setInterval(updateThreatIntelligence, 60 * 60 * 1000);

export const threatIntelligenceMiddleware = async (req, res, next) => {
    try {
        // Bypass threat intelligence in non-production environments
        if (process.env.NODE_ENV !== 'production') {
            return next();
        }

        const decision = await aj.protect(req);
        const ip = decision.ip.src;
        const userAgent = req.headers["user-agent"];

        if (knownBadIPs.has(ip)) {
            console.warn("Known bad IP detected:", ip);
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        if (knownBadUserAgents.has(userAgent)) {
            console.warn("Known bad user agent detected:", userAgent);
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        next();
    } catch (error) {
        console.error("Threat intelligence middleware error:", error);
        // Allow request to continue even if threat check fails
        next();
    }
};