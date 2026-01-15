import { NextFunction, Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const existing = await prisma.service.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Service not found' });

        await prisma.service.delete({ where: { id } });

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        next(error);
    }
};
