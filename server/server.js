require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// ── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// Export a getter so routes can emit events without circular dependency issues
let _io = io;
const getIO = () => _io;
module.exports = { getIO };

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Trust proxy for accurate IP detection behind reverse proxies
app.set("trust proxy", true);

// ── Routes ───────────────────────────────────────────────────────────────────
const pollRoutes = require("./routes/polls");
app.use("/api/polls", pollRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io Events ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client joins a specific poll room to receive real-time updates
    socket.on("joinPoll", (pollId) => {
        if (pollId) {
            socket.join(pollId);
            console.log(`[Socket] ${socket.id} joined room: ${pollId}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

// ── Database Connection & Server Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/poll-rooms";

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("[DB] Connected to MongoDB");
        server.listen(PORT, () => {
            console.log(`[Server] Running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("[DB] Connection failed:", err.message);
        process.exit(1);
    });
