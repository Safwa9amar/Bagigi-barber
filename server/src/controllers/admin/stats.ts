import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const getStats = async (req: Request, res: Response) => {
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
            prisma.booking.count({
                where: {
                    service: { userId: adminUserId },
                    ...dateFilter,
                }
            }),
            prisma.booking.count({
                where: {
                    service: { userId: adminUserId },
                    status: 'PENDING',
                    ...dateFilter
                }
            }),
            prisma.booking.count({
                where: {
                    service: { userId: adminUserId },
                    createdAt: {
                        gte: today
                    }
                }
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    adminId: adminProfile.id,
                    ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {})
                }
            }),
            prisma.service.count({
                where: { userId: adminUserId }
            }),
            prisma.booking.findMany({
                where: {
                    service: { userId: adminUserId },
                    status: 'DONE',
                    ...dateFilter
                },
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
