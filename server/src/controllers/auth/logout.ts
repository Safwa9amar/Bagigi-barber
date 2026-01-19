import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const logout = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user?.id || user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Clear the push token for this user
        await prisma.user.update({
            where: { id: userId },
            data: { pushToken: null },
        });

        console.log(`[Auth] User ${userId} logged out and push token cleared`);

        res.json({ success: true, message: 'Logged out and push token cleared' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
