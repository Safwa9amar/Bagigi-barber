import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketRole: string | null = null; // track the role the socket was created with

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/bagigi/api";
const SOCKET_URL = SERVER_URL.replace('/bagigi/api', '').replace('/api', '');

export const getSocket = (userId: string, role: string) => {
    // If socket exists but was created with a different role, disconnect and recreate
    if (socket && socketRole !== role) {
        socket.disconnect();
        socket = null;
        socketRole = null;
    }

    if (!socket) {
        socketRole = role;
        socket = io(SOCKET_URL, {
            path: '/bagigi/api/socket.io',
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            query: { userId, role },
        });

        socket.on("connect", () => {
            console.log(`Global socket connected as ${role}`);
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
        socketRole = null;
    }
};
