import { NextFunction, Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const adminUserId = (req as Request & { user?: { id?: string } }).user?.id;
        if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

        const existing = await prisma.service.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Service not found' });
        if (existing.userId !== adminUserId) return res.status(403).json({ error: 'Forbidden' });

        await prisma.service.delete({ where: { id } });

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        next(error);
    }
};
