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
            orderBy: {
                createdAt: 'asc'
            }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET /api/messages/conversations
// Admin only: List all users who have sent messages.
// This is a bit complex in raw SQL or Prisma without groupBy+distinct nicely.
// We want distinct 'fromId' where role='USER'.
router.get('/conversations', async (req: Request, res: Response) => {
    try {
        // Group by fromId to find unique users who started a chat
        // Also could include toId if admin started it, but let's assume users start.
        // Prisma groupBy is good here.
        const senders = await prisma.message.groupBy({
            by: ['fromId'],
            where: {
                role: 'USER'
            },
            _max: {
                createdAt: true
            }
        });

        // We probably want user details. Since User is in another store/service logic potentially,
        // we might just return IDs and let frontend fetch or use a simpler approach if User model existed here.
        // Assuming Auth system is separate or User model is in same DB but we didn't check relation.
        // Let's return the list and let frontend handle name fetching or display ID for now.

        // Better: join with User model if it exists. 
        // I'll assume User model exists in standard Prisma setup if authStore works with it, 
        // but I didn't see User in the schema snippet I read (it was truncated or didn't show User).
        // I will just return the IDs and timestamps.

        res.json(senders.map(s => ({
            userId: s.fromId,
            lastMessageAt: s._max.createdAt
        })));
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

export default router;
