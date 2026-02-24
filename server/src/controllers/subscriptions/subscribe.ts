import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import {
  expireOutdatedSubscriptions,
  getPlanEndDate,
  getPlanPrice,
  parsePlan,
} from './utils';

export async function subscribe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const plan = parsePlan(req.body?.plan);
    if (!plan) {
      return res.status(400).json({ error: 'Plan must be MONTHLY or YEARLY' });
    }

    await expireOutdatedSubscriptions(userId);

    const now = new Date();
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'desc' },
    });

    const startsAt = activeSubscription ? activeSubscription.endsAt : now;
    const endsAt = getPlanEndDate(plan, startsAt);

    const createdSubscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        price: getPlanPrice(plan),
        startsAt,
        endsAt,
      },
    });

    return res.status(201).json({
      message: `${plan.toLowerCase()} subscription activated`,
      data: createdSubscription,
    });
  } catch (error) {
    console.error('subscribe error:', error);
    return res.status(500).json({ error: 'Failed to activate subscription' });
  }
}
