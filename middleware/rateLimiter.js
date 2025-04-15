// middleware/rateLimiter.js
const RequestLog = require("../model/requestLog.js");

const rateLimiter = async (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const MAX_REQUESTS = 5;
    const TIME_WINDOW_MS = 1000; // 1 second

    const now = new Date();

    let log = await RequestLog.findOne({ ip });

    if (!log) {
        log = new RequestLog({ ip, timestamps: [now] });
    } else {
        // Remove old timestamps beyond 1 second
        log.timestamps = log.timestamps.filter(
            (time) => now - time <= TIME_WINDOW_MS
        );

        if (log.timestamps.length >= MAX_REQUESTS) {
            return res.status(429).json({ error: "Rate limit exceeded. Try again shortly." });
        }

        log.timestamps.push(now);
    }

    await log.save();
    next();
};

module.exports = rateLimiter;

