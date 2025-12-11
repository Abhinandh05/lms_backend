import {aj} from "../config/arcjet.js";

export class ArcjetAnalytics {
    constructor() {
        this.events = [];
        this.maxEvents = 10000; // Keep last 10k events in memory
    }

    logEvent(decision, req, result) {
        const event = {
            id: decision.id,
            timestamp: new Date(),
            conclusion: decision.conclusion,
            reason: decision.reason?.toString(),
            ip: {
                address: decision.ip.src,
                country: decision.ip.country,
                city: decision.ip.city,
                isHosting: decision.ip.isHosting(),
                isVpn: decision.ip.isVpn(),
                isProxy: decision.ip.isProxy(),
            },
            request: {
                method: req.method,
                path: req.path,
                userAgent: req.headers["user-agent"],
            },
            result: result,
        };

        this.events.push(event);

        // Keep only last maxEvents
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
    }

    getStats(hours = 24) {
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        const recentEvents = this.events.filter((e) => e.timestamp >= cutoff);

        return {
            total: recentEvents.length,
            allowed: recentEvents.filter((e) => e.result === "allowed").length,
            blocked: recentEvents.filter((e) => e.result === "blocked").length,
            byCountry: this.groupBy(recentEvents, (e) => e.ip.country),
            byPath: this.groupBy(recentEvents, (e) => e.request.path),
            byReason: this.groupBy(
                recentEvents.filter((e) => e.result === "blocked"),
                (e) => e.reason
            ),
        };
    }

    groupBy(array, keyFn) {
        return array.reduce((acc, item) => {
            const key = keyFn(item);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }
}

export const analytics = new ArcjetAnalytics();

// Use in middleware
export const analyticsMiddleware = async (req, res, next) => {
    const decision = await aj.protect(req);
    const result = decision.isDenied() ? "blocked" : "allowed";

    analytics.logEvent(decision, req, result);

    if (decision.isDenied()) {
        return res.status(403).json({
            success: false,
            message: "Request blocked",
        });
    }

    next();
};

// Get analytics endpoint
export const getAnalytics = async (req, res) => {
    const hours = parseInt(req.query.hours) || 24;
    const stats = analytics.getStats(hours);

    res.json({
        success: true,
        period: `${hours} hours`,
        stats,
    });
};