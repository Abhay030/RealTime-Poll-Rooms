require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const errorHandler = require("./middleware/errorHandler");
const pollRoutes = require("./routes/polls");

// ── Initialize Express & HTTP Server ─────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Initialize Socket.io ─────────────────────────────────────────────────────
initSocket(server);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Trust proxy for accurate IP detection behind reverse proxies
app.set("trust proxy", true);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/polls", pollRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`[Server] Running on http://localhost:${PORT}`);
    });
});
