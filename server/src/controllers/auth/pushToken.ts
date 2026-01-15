import prisma from '@/lib/prisma';
import { NextFunction, Request, Response } from 'express';


export const savePushToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { pushToken } = req.body;
        const userId = (req as any).user.userId; // From authenticateJWT middleware

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
