import { io } from "socket.io-client";

// creating the instance of socket.io
const URL = import.meta.env.VITE_API_URL || "";

const socket = io(URL, {
    autoConnect: false,
});

export default socket;
