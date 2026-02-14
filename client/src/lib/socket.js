import { io } from "socket.io-client";

/**
 * Singleton Socket.io client instance.
 * In development, Vite proxies /socket.io to the backend.
 * In production, set VITE_API_URL to the backend origin.
 */
const URL = import.meta.env.VITE_API_URL || "";

const socket = io(URL, {
    autoConnect: false,
});

export default socket;
