import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get internal ID function if needed, but we use string UUIDs mostly.

// GET /api/messages/history/:userId
// If requester is user, userId must match (or be admin).
// Fetches all messages where fromId=userId OR toId=userId.
router.get('/history/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: userId },
                    { toId: userId }
                ]
            },
            include: {
                from: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Map messages to include fromName
        const messagesWithNames = messages.map(m => ({
            ...m,
            fromName: m.from?.name || m.from?.email?.split('@')[0] || 'Unknown'
        }));

        res.json(messagesWithNames);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET /api/messages/conversations
// Admin only: List all users who have sent messages.
router.get('/conversations', async (req: Request, res: Response) => {
    try {
        // Find unique fromIds for USER role messages
        const senders = await prisma.message.groupBy({
            by: ['fromId'],
            where: {
                role: 'USER'
            },
            _max: {
                createdAt: true
            }
        });

        // Fetch user names for these IDs
        const userIds = senders.map(s => s.fromId);
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        const userMap = users.reduce((acc: any, u) => {
            acc[u.id] = u.name || u.email.split('@')[0];
            return acc;
        }, {});

        res.json(senders.map(s => ({
            userId: s.fromId,
            userName: userMap[s.fromId] || 'Unknown',
            lastMessageAt: s._max.createdAt
        })));
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

export default router;
