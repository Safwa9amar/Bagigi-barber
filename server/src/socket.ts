import { Server, Socket } from 'socket.io';
import { Server as HttpServer, createServer } from 'http';
import app from './app';
import config from './config/config';
import { sendPushNotification } from './lib/push';
import prisma from './lib/prisma';

// Disable console.log in production
if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
    console.info = () => { };
    console.warn = () => { };
    console.debug = () => { };
}

interface MessagePayload {
    content: string;
    to?: string; // If from admin, 'to' is userId
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
    path: '/bagigi/api/socket.io',
    cors: {
        origin: "*", // Allow all origins for simplicity in dev
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    const role = socket.handshake.query.role as string;


    if (!userId) {
        console.log('Socket connection rejected: No userId');
        socket.disconnect();
        return;
    }

    console.log(`User connected: ${userId} (${role})`);

    // Join room based on userId
    socket.join(userId);

    // If admin, join special admin room
    if (role === 'ADMIN') {
        console.log('Admin joined admin room');
        socket.join('admin');

    }


    // ... (inside connection)

    socket.on('send_message', async (data: MessagePayload) => {
        console.log('Message received:', data, 'from', userId);

        // Save to DB
        let savedMessage;
        try {
            savedMessage = await prisma.message.create({
                data: {
                    content: data.content,
                    fromId: userId,
                    toId: role === 'ADMIN' ? data.to : undefined, // If from user, toId is implicit (admin read) or undefined
                    role: role || 'USER'
                }
            });
        } catch (error) {
            console.error('Error saving message:', error);
            return;
        }

        // Fetch sender name
        const sender = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
        });

        const fromName = sender?.name || sender?.email?.split('@')[0] || "Unknown";

        // Construct payload
        const message = {
            id: savedMessage.id,
            from: userId,
            fromName: fromName,
            content: savedMessage.content,
            timestamp: savedMessage.createdAt.toISOString(),
            role: savedMessage.role
        };

        if (role === 'ADMIN' && data.to) {
            // Admin sending to specific user
            io.to(data.to).emit('receive_message', message);

            // SEND PUSH NOTIFICATION TO USER
            try {
                const recipient = await prisma.user.findUnique({
                    where: { id: data.to },
                    select: { pushToken: true }
                });

                if (recipient?.pushToken) {
                    await sendPushNotification(
                        recipient.pushToken,
                        "New Message from Bagigi Barber",
                        data.content,
                        { messageId: message.id }
                    );
                    console.log(`Push sent to ${data.to}`);
                }
            } catch (pe) {
                console.error("Failed to send push:", pe);
            }

            // User sending to admin
            io.to('admin').emit('receive_message', message);
            io.to(userId).emit('receive_message', message);

            // NOTIFY ADMINS
            try {
                const { notifyAdmins } = await import('@/lib/notification-service');
                await notifyAdmins(
                    `New Message from ${fromName}`,
                    data.content,
                    { messageId: message.id, fromUser: userId }
                );
            } catch (pe) {
                console.error("Failed to send admin push for message:", pe);
            }
        }
    });

    socket.on('typing', (data: { to?: string }) => {
        if (role === 'ADMIN' && data.to) {
            io.to(data.to).emit('typing', { from: 'admin' });
        } else {
            io.to('admin').emit('typing', { from: userId });
        }
    });

    socket.on('stop_typing', (data: { to?: string }) => {
        if (role === 'ADMIN' && data.to) {
            io.to(data.to).emit('stop_typing', { from: 'admin' });
        } else {
            io.to('admin').emit('stop_typing', { from: userId });
        }
    });
    // push a notification to all users



    socket.on('disconnect', () => {
        console.log('User disconnected:', userId);
    });
});

httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

export const socketIo = io;
