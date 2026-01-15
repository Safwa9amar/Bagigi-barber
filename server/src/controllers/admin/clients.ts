import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export const list = async (req: Request, res: Response) => {
    try {
        const clients = await prisma.user.findMany({
            where: {
                role: 'USER'
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
                        bookings: true
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
