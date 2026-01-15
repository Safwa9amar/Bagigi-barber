import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const list = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        priceFrom: true,
                        duration: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const data: any = { status };

        if (status === 'IN_PROGRESS') {
            data.startedAt = new Date();
        } else if (status === 'DONE') {
            data.finishedAt = new Date();
        }

        const booking = await prisma.booking.update({
            where: { id },
            data,
            include: {
                user: true,
                service: true
            }
        });

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
