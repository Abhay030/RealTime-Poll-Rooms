/**
 * Global error handling middleware for Express.
 * Catches all errors thrown or passed via next(err) and returns
 * a consistent JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: messages.join(", ") });
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(400).json({ error: "Invalid poll ID format" });
    }

    // MongoDB duplicate key (e.g., duplicate vote)
    if (err.code === 11000) {
        return res.status(403).json({ error: "You have already voted on this poll" });
    }

    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : "Internal server error";

    res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
