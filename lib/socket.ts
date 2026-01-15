import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const SOCKET_URL = SERVER_URL.replace('/api', '');

export const getSocket = (userId: string, role: string) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
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
