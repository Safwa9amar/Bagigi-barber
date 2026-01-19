import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/bagigi/api";
// We want to extract the base URL (origin) for the socket connection
// If SERVER_URL is https://ataa-platform.com/bagigi/api, we want https://ataa-platform.com
// If SERVER_URL is http://localhost:3000/bagigi/api, we want http://localhost:3000
const SOCKET_URL = SERVER_URL.replace('/bagigi/api', '').replace('/api', '');

export const getSocket = (userId: string, role: string) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            path: '/bagigi/api/socket.io',
            transports: ['polling', 'websocket'], // Force trying polling first, then upgrade (default but explicit is safe)
            reconnection: true,
            reconnectionAttempts: 5,
            query: {
                userId,
                role,
            },
        });

        socket.on("connect", () => {
            console.log("Global socket connected");
        });

        socket.on("disconnect", () => {
            console.log("Global socket disconnected");
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
