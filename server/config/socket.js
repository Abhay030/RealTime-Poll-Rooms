const { Server } = require("socket.io");

let io;

/**
 * Initialize Socket.io server with the given HTTP server.
 * Called once from server.js during startup.
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, ""),
            methods: ["GET", "POST"],
        },
    });

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

    return io;
};

/**
 * Get the Socket.io instance. Must be called after initSocket().
 */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized. Call initSocket() first.");
    }
    return io;
};

module.exports = { initSocket, getIO };
