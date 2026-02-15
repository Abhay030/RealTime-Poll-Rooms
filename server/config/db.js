const mongoose = require("mongoose");

/**
 * Connect to MongoDB using the URI from environment variables.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    } catch (err) {
        console.error(`[DB] Connection failed: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
