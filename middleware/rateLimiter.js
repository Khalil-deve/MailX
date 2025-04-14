// middleware/rateLimiter.js
const RequestLog = require("../model/requestLog.js");

const rateLimiter = async (req, res, next) => {
    const ip = req.ip;
    console.log("your ip address is: ", ip);
    const now = new Date();

    let log = await RequestLog.findOne({ ip });

    if (!log) {
        log = new RequestLog({ ip, timestamps: [now] });
    } else {
        // Remove old timestamps beyond 1 second
        log.timestamps = log.timestamps.filter(
            (time) => now - time <= 1000
        );

        if (log.timestamps.length >= 5) {
            return res.status(429).json({ error: "Rate limit exceeded. Try again shortly." });
        }

        log.timestamps.push(now);
    }

    await log.save();
    next();
};

module.exports = rateLimiter;

