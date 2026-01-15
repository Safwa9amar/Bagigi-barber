import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import { addMinutes, format, isBefore, set, startOfDay } from 'date-fns';

export async function estimate(req: Request, res: Response) {
    try {
        const { serviceId, date } = req.body; // date expected as YYYY-MM-DDor query param? Let's use body for consistency or query. POST is fine for "calculation".

        if (!serviceId) {

            return res.status(400).json({ error: 'Service ID is required' });
        }

        if (!date) {

            return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
        }

        // 1. Fetch service for duration
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {

            return res.status(404).json({ error: 'Service not found' });
        }

        // 2. Fetch Shop Working Hours
        const requestedDate = new Date(date);
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

        // 3. Calculate Queue
        const startOfRequestedDay = startOfDay(requestedDate);
        const endOfRequestedDay = set(requestedDate, { hours: 23, minutes: 59, seconds: 59 });

        const todaysBookings = await prisma.booking.findMany({
            where: {
                service: {
                    userId: providerId
                },
                status: {
                    in: ['PENDING', 'IN_PROGRESS'],
                },
                estimatedAt: {
                    gte: startOfRequestedDay,
                    lte: endOfRequestedDay
                }
            },
            orderBy: {
                estimatedAt: 'asc',
            },
            include: {
                service: true
            }
        });

        // 4. Calculate estimated start time
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
            message: `Estimated start: ${format(calculatedStartTime, 'HH:mm')} (#${position} in queue)`
        });

    } catch (e) {
        console.error('Estimate error:', e);
        return res.status(500).json({ error: 'Estimate failed' });
    }
}
