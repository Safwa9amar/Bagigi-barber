import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import { addMinutes, format, isBefore, max, parse, startOfDay, set } from 'date-fns';

export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { serviceId, date } = req.body; // date expected as YYYY-MM-DD

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

    // 2. Fetch Shop Working Hours for the requested day
    // We need to know the day of week (0=Sunday, etc)
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Find a provider/admin. For now, we assume single-provider or we pick the service owner.
    // The service has a userId (the provider).
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

    // Parse start time (e.g., "09:00")
    const [startHour, startMinute] = workingDay.startTime.split(':').map(Number);
    // Create Date object for shop open time on the requested date
    const shopOpenTime = set(requestedDate, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });

    // 3. Calculate Queue
    // Fetch all PENDING or IN_PROGRESS bookings for that provider on that day
    // We need to filter by date.
    // Assuming createdAt or estimatedAt falls within that day.
    // Ideally we filter by the 'date' field if we had one, but currently schema doesn't have a 'date' field separate from timestamps.
    // Wait, implementation plan said "Add Booking model (date...)" but in schema I merged, I missed adding a specific 'date' field or 'scheduledFor'.
    // The schema has estimatedAt. We should use estimatedAt to filter for the day.
    // But for a new booking, we are SETTING estimatedAt.
    // So we look for bookings where estimatedAt is within the requested day.

    const startOfRequestedDay = startOfDay(requestedDate);
    const endOfRequestedDay = set(requestedDate, { hours: 23, minutes: 59, seconds: 59 });

    const todaysBookings = await prisma.booking.findMany({
      where: {
        userId: { not: undefined }, // This should be provider's bookings?
        // Wait, the schema links Booking to User (customer). It doesn't explicitly link to Provider, but via Service -> User(Provider).
        // So we need bookings for services owned by this provider.
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
        estimatedAt: 'asc', // Process in order
      },
      include: {
        service: true // to get duration if needed, though duration is stored in booking
      }
    });

    // 4. Calculate estimated start time
    // Start time is max of:
    // - Shop Open Time
    // - Now (if booking for today)
    // - End time of the last booking in queue

    let calculatedStartTime = shopOpenTime;
    const now = new Date();

    // If booking for today, can't start in the past
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

    // 5. Position
    const position = todaysBookings.length + 1;

    // 6. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        duration: service.duration,
        position,
        status: 'PENDING',
        estimatedAt: calculatedStartTime,
      },
    });

    return res.json({
      ...booking,
      formattedEstimatedAt: format(calculatedStartTime, 'HH:mm'),
      message: `Booking confirmed. You are #${position} in queue. Estimated start: ${format(calculatedStartTime, 'HH:mm')}`
    });

  } catch (e) {
    console.error('Booking creation error:', e);
    return res.status(500).json({ error: 'Booking failed' });
  }
}
