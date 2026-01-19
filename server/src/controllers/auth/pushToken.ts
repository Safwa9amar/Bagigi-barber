import prisma from '@/lib/prisma';
import { NextFunction, Request, Response } from 'express';


export const savePushToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { pushToken } = req.body;
        const user = (req as any).user;
        const userId = user?.id || user?.userId;

        console.log('Push token request from user:', userId, 'Payload:', user);

        if (!userId) {
            console.error('Push token error: No userId found in token');
            res.status(401).json({ message: 'Unauthorized: User mapping failed' });
            return;
        }

        if (!pushToken) {
            res.status(400).json({ message: 'Push token is required' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { pushToken },
        });

        res.status(200).json({ message: 'Push token saved successfully' });
    } catch (error) {
        next(error);
    }
};
