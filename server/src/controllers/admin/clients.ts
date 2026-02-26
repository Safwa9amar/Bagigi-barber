import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const list = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user?.id as string | undefined;
        if (!adminId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const adminProfile = await prisma.admin.findUnique({
            where: { userId: adminId },
            select: { id: true },
        });
        if (!adminProfile) {
            return res.status(404).json({ success: false, error: 'Admin profile not found' });
        }

        const clients = await prisma.user.findMany({
            where: {
                role: 'USER',
                adminId: adminProfile.id,
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
                        bookings: true,
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
        const adminUserId = (req as any).user?.id as string | undefined;
        if (!adminUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const adminProfile = await prisma.admin.findUnique({
            where: { userId: adminUserId },
            select: { id: true },
        });
        if (!adminProfile) {
            return res.status(404).json({ success: false, error: 'Admin profile not found' });
        }

        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, error: 'Title and body are required' });
        }

        const targets = await prisma.user.findMany({
            where: {
                role: 'USER',
                adminId: adminProfile.id,
                pushToken: { not: null },
            },
            select: { pushToken: true },
        });

        const { sendPushNotification } = await import('@/lib/push');
        for (const target of targets) {
            if (!target.pushToken) continue;
            await sendPushNotification(target.pushToken, title, body, { type: 'admin_broadcast' });
        }

        res.json({
            success: true,
            message: `Broadcast sent to ${targets.length} client(s)`
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
