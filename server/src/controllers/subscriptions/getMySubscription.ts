import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import { differenceInCalendarDays } from 'date-fns';
import { expireOutdatedSubscriptions } from './utils';

export async function getMySubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await expireOutdatedSubscriptions(userId);

    const now = new Date();
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        endsAt: { gt: now },
        status: { in: ['ACTIVE', 'CANCELLED'] },
      },
      orderBy: { endsAt: 'desc' },
    });

    if (!currentSubscription) {
      return res.json({
        isSubscribed: false,
        data: null,
      });
    }

    return res.json({
      isSubscribed: true,
      daysRemaining: differenceInCalendarDays(currentSubscription.endsAt, now),
      data: currentSubscription,
    });
  } catch (error) {
    console.error('getMySubscription error:', error);
    return res.status(500).json({ error: 'Failed to get subscription' });
  }
}
