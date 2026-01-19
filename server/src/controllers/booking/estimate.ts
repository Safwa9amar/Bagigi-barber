import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import { addMinutes, format, isBefore, set, startOfDay } from 'date-fns';

export async function estimate(req: Request, res: Response) {
    try {
        const { serviceId, date } = req.body;
        const authUser = (req as any).user;
        const userId = authUser?.id || authUser?.userId;

        if (!serviceId) {
            return res.status(400).json({ error: 'Service ID is required' });
        }

        if (!date) {
            return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
        }

        // 1. Fetch service
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const requestedDate = new Date(date);
        const startOfRequestedDay = startOfDay(requestedDate);
        const endOfRequestedDay = set(requestedDate, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });

        // 1.5 Check if the user already has a booking on this day
        let userBooking = null;
        if (userId) {
            userBooking = await prisma.booking.findFirst({
                where: {
                    userId,
                    estimatedAt: {
                        gte: startOfRequestedDay,
                        lte: endOfRequestedDay
                    },
                    status: { not: 'CANCELLED' }
                },
                include: { service: true }
            });
        }

        // 2. Fetch Shop Working Hours
        const dayOfWeek = requestedDate.getDay();
        const providerId = service.userId;

        const workingDay = await prisma.workingDay.findFirst({
            where: {
                userId: providerId,
                day: dayOfWeek,
            },
        });

        if (!workingDay || !workingDay.isOpen) {
            return res.status(400).json({ error: 'Shop is closed on this day' });
        }

        const [startHour, startMinute] = workingDay.startTime.split(':').map(Number);
        const shopOpenTime = set(requestedDate, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });

        // 3. Calculate Queue and Schedule
        const todaysBookings = await prisma.booking.findMany({
            where: {
                service: { userId: providerId },
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                estimatedAt: {
                    gte: startOfRequestedDay,
                    lte: endOfRequestedDay
                }
            },
            orderBy: { estimatedAt: 'asc' },
        });

        // Calculate schedule for transparency
        const schedule = todaysBookings.map(b => ({
            position: b.position,
            time: format(b.estimatedAt!, 'HH:mm'),
            isUser: b.userId === userId
        }));

        // 4. Calculate estimated start time for the NEW booking
        let calculatedStartTime = shopOpenTime;
        const now = new Date();

        if (isBefore(shopOpenTime, now) && format(now, 'yyyy-MM-dd') === date) {
            calculatedStartTime = now;
        }

        if (todaysBookings.length > 0) {
            const lastBooking = todaysBookings[todaysBookings.length - 1];
            if (lastBooking.estimatedAt) {
                const lastBookingEnd = addMinutes(new Date(lastBooking.estimatedAt), lastBooking.duration);
                if (isBefore(calculatedStartTime, lastBookingEnd)) {
                    calculatedStartTime = lastBookingEnd;
                }
            }
        }

        const position = todaysBookings.length + 1;

        return res.json({
            position,
            estimatedAt: calculatedStartTime,
            formattedEstimatedAt: format(calculatedStartTime, 'HH:mm'),
            userBooking: userBooking ? {
                id: userBooking.id,
                status: userBooking.status,
                position: userBooking.position,
                time: format(userBooking.estimatedAt!, 'HH:mm'),
                serviceName: userBooking.service.name
            } : null,
            schedule,
            message: `Estimated start: ${format(calculatedStartTime, 'HH:mm')} (#${position} in queue)`
        });

    } catch (e) {
        console.error('Estimate error:', e);
        return res.status(500).json({ error: 'Estimate failed' });
    }
}
