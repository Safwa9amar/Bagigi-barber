import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import { expireOutdatedSubscriptions } from './utils';

export async function cancelSubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await expireOutdatedSubscriptions(userId);

    const current = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endsAt: { gt: new Date() },
      },
      orderBy: { endsAt: 'desc' },
    });

    if (!current) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const cancelled = await prisma.subscription.update({
      where: { id: current.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return res.json({
      message: 'Subscription cancelled. Access remains active until expiry date.',
      data: cancelled,
    });
  } catch (error) {
    console.error('cancelSubscription error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
