import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

export async function list(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId,
            },
            include: {
                service: true
            },
            orderBy: {
                estimatedAt: 'desc', // Show newest/upcoming first? Or sort by status?
                // Typically upcoming first then past.
                // For simplicity: desc by date = newest created/scheduled first.
            },
        });

        // We might want to separate Active vs Past?
        // For now, return all list.

        // Format for frontend
        const formattedBookings = bookings.map(b => ({
            id: b.id,
            serviceName: b.service.name,
            serviceImage: b.service.image,
            date: b.estimatedAt, // This is the calculated start time
            status: b.status,
            position: b.position,
            price: b.service.priceFrom, // or priceTo if set?
        }));

        return res.json(formattedBookings);
    } catch (e) {
        console.error('List bookings error:', e);
        return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
}
