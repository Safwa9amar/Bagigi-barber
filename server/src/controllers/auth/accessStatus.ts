import { Request, Response } from 'express';
import { getBarberAccessStatus, TRIAL_DAYS } from '@/lib/barber-access';

export const accessStatus = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const status = await getBarberAccessStatus(userId);

    const payload: any = {
      blocked: status.blocked,
      reason: status.reason ?? null,
      trialDays: TRIAL_DAYS,
      trialEndsAt: status.trialEndsAt,
      trialDaysRemaining: status.trialDaysRemaining,
      subscription: status.subscription,
    };

    if (status.blocked) {
      payload.message = status.message;
    }

    return res.json(payload);
  } catch (error) {
    console.error('accessStatus error:', error);
    return res.status(500).json({ error: 'Failed to check access status' });
  }
};
