import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const list = async (req: Request, res: Response) => {
    try {
        const clients = await prisma.user.findMany({
            where: {
                role: 'USER'
            },
            select: {
                id: true,
                email: true,
                phone: true,
                verified: true,
                emailConfirmed: true,
                createdAt: true,
                _count: {
                    select: {
                        bookings: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: clients
        });
    } catch (error) {
        console.error('Error fetching admin clients:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const broadcast = async (req: Request, res: Response) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, error: 'Title and body are required' });
        }

        const { broadcastNotification } = await import('@/lib/notification-service');
        await broadcastNotification(title, body, { type: 'admin_broadcast' });

        res.json({
            success: true,
            message: 'Broadcast started successfully'
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
