import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const getWorkingDays = async (req: Request, res: Response) => {
    try {
        // Since there is only one shop/admin currently, we fetch for the first admin or just all working days
        // if we assume they belong to the system. 
        // Based on model, WorkingDay has userId. 
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        const hours = await prisma.workingDay.findMany({
            where: { userId: admin.id },
            orderBy: { day: 'asc' }
        });

        res.json({ success: true, data: hours });
    } catch (error) {
        console.error('Error fetching working days:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateWorkingDay = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startTime, endTime, isOpen } = req.body;

    try {
        const updated = await prisma.workingDay.update({
            where: { id },
            data: {
                startTime,
                endTime,
                isOpen
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating working day:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
