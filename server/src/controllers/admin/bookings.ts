import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import { addMinutes, format, isBefore, startOfDay, set } from 'date-fns';

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
        const { status, estimatedAt } = req.body;

        if (status && !['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const data: any = {};

        if (status) {
            data.status = status;

            if (status === 'IN_PROGRESS') {
                data.startedAt = new Date();
            } else if (status === 'DONE') {
                data.finishedAt = new Date();
            }
        }

        if (estimatedAt) {
            data.estimatedAt = new Date(estimatedAt);
        }

        const booking = await prisma.booking.update({
            where: { id },
            data,
            include: {
                user: true,
                service: true
            }
        });

        // 🔹 Notify User of changes
        if (booking.user?.pushToken) {
            try {
                const { notifyUser } = await import('@/lib/notification-service');

                let notificationTitle = 'Booking Update 📅';
                let notificationBody = '';

                // Get formatted date/time
                const formattedTime = booking.estimatedAt ? format(booking.estimatedAt, 'HH:mm') : '--:--';
                const formattedDate = booking.estimatedAt ? format(booking.estimatedAt, 'MMM dd') : '';
                const dateTimeStr = `${formattedDate} ${formattedTime}`;

                if (status && estimatedAt) {
                    notificationBody = `Your booking for ${booking.service.name} has been updated to ${status} and rescheduled for ${dateTimeStr}.`;
                } else if (status) {
                    notificationBody = `Your booking for ${booking.service.name} is now ${status}. ${estimatedAt ? 'Rescheduled for ' + dateTimeStr : 'Time: ' + dateTimeStr}.`;
                } else if (estimatedAt) {
                    notificationBody = `Your booking for ${booking.service.name} has been rescheduled to ${dateTimeStr}.`;
                }

                if (notificationBody) {
                    console.log(`[AdminBooking] Triggering notification for user ${booking.userId}: "${notificationBody}"`);
                    await notifyUser(
                        booking.userId!,
                        notificationTitle,
                        notificationBody,
                        { bookingId: booking.id, type: 'booking_update' }
                    );
                }
            } catch (notificationError) {
                console.error('[AdminBooking] Failed to trigger notification:', notificationError);
            }
        } else {
            console.log(`[AdminBooking] Skip notification: User ${booking.userId} has no push token`);
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const createWalkIn = async (req: Request, res: Response) => {
    try {
        const { serviceId, guestName, guestPhone } = req.body;

        if (!serviceId || !guestName) {
            return res.status(400).json({ success: false, error: 'Service ID and guest name are required' });
        }

        // 1. Fetch service
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        // 2. Fetch Shop Working Hours
        const requestedDate = new Date();
        const dayOfWeek = requestedDate.getDay();
        const providerId = service.userId;

        const workingDay = await prisma.workingDay.findFirst({
            where: {
                userId: providerId,
                day: dayOfWeek,
            },
        });

        if (!workingDay || !workingDay.isOpen) {
            return res.status(400).json({ success: false, error: 'Shop is closed today' });
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
            }
        });

        // 4. Calculate estimated start time
        let calculatedStartTime = shopOpenTime;
        const now = new Date();

        if (isBefore(shopOpenTime, now)) {
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

        // 5. Position
        const position = todaysBookings.length + 1;

        // 6. Create Booking
        const booking = await prisma.booking.create({
            data: {
                serviceId,
                guestName,
                guestPhone,
                isWalkIn: true,
                duration: service.duration,
                position,
                status: 'PENDING',
                estimatedAt: calculatedStartTime,
            },
            include: {
                service: true
            }
        });

        res.json({
            success: true,
            data: {
                ...booking,
                formattedEstimatedAt: format(calculatedStartTime, 'HH:mm'),
            }
        });

    } catch (error) {
        console.error('Error creating walk-in booking:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const notifyUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                user: true,
                service: true
            }
        });

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Walk-in clients don't have push tokens
        if (booking.isWalkIn || !booking.user) {
            return res.status(400).json({ success: false, error: 'Cannot notify walk-in clients' });
        }

        if (!booking.user.pushToken) {
            return res.status(400).json({ success: false, error: 'User has no push token registered' });
        }

        // Use centralized notification service
        const { notifyUser } = await import('@/lib/notification-service');

        await notifyUser(
            booking.user.id,
            'Your Turn is Starting Soon! 🔔',
            `Get ready! Your ${booking.service.name} appointment is about to begin.`,
            { bookingId: booking.id, type: 'turn_starting' }
        );

        res.json({
            success: true,
            message: 'Notification sent successfully'
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
