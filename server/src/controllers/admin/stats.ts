import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const getStats = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dateFilter: any = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
            if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
        }

        const [
            totalBookings,
            pendingBookings,
            todayBookings,
            totalClients,
            totalServices,
            doneBookings
        ] = await Promise.all([
            prisma.booking.count({ where: dateFilter }),
            prisma.booking.count({ where: { status: 'PENDING', ...dateFilter } }),
            prisma.booking.count({
                where: {
                    createdAt: {
                        gte: today
                    }
                }
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {})
                }
            }),
            prisma.service.count(),
            prisma.booking.findMany({
                where: { status: 'DONE', ...dateFilter },
                select: {
                    service: {
                        select: { priceFrom: true }
                    }
                }
            })
        ]);

        const totalRevenue = doneBookings.reduce((sum, booking) => sum + (booking.service?.priceFrom || 0), 0);

        res.json({
            success: true,
            data: {
                totalBookings,
                pendingBookings,
                todayBookings,
                totalClients,
                totalServices,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
