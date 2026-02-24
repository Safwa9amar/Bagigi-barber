import { Request, Response } from 'express';
import { addDays, differenceInCalendarDays } from 'date-fns';
import prisma from '@/lib/prisma';

const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || 7);

export const accessStatus = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'ADMIN') {
      return res.json({
        blocked: false,
        reason: null,
        trialDays: TRIAL_DAYS,
      });
    }

    const now = new Date();
    const trialEndsAt = addDays(user.createdAt, TRIAL_DAYS);
   
    if (differenceInCalendarDays(trialEndsAt, now) >= 0) {
      return res.json({
        blocked: false,
        reason: null,
        trialDays: TRIAL_DAYS,
        trialEndsAt,
        trialDaysRemaining: Math.max(differenceInCalendarDays(trialEndsAt, now), 0),
      });
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['ACTIVE', 'CANCELLED'] },
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'desc' },
      select: {
        id: true,
        plan: true,
        status: true,
        startsAt: true,
        endsAt: true,
      },
    });

    if (activeSubscription) {
      return res.json({
        blocked: false,
        reason: null,
        trialDays: TRIAL_DAYS,
        trialEndsAt,
        subscription: activeSubscription,
      });
    }

    return res.json({
      blocked: true,
      reason: 'TRIAL_ENDED',
      trialDays: TRIAL_DAYS,
      trialEndsAt,
      message: 'Trial ended. Subscription is required to continue.',
    });
  } catch (error) {
    console.error('accessStatus error:', error);
    return res.status(500).json({ error: 'Failed to check access status' });
  }
};
