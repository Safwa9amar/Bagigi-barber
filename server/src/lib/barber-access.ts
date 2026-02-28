import { addDays, differenceInCalendarDays } from 'date-fns';
import prisma from './prisma';

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || 7);

export type BarberAccessReason = 'TRIAL_ENDED' | 'NO_SUBSCRIPTION';

const BLOCKED_REASON_MESSAGES: Record<BarberAccessReason, string> = {
  TRIAL_ENDED: 'Trial ended. Subscription is required to continue.',
  NO_SUBSCRIPTION: 'Subscription is required to continue providing services.',
};

export type BarberAccessStatus = {
  blocked: boolean;
  reason?: BarberAccessReason;
  trialEndsAt: Date | null;
  trialDaysRemaining: number | null;
  subscription: {
    id: string;
    plan: string;
    status: string;
    startsAt: Date;
    endsAt: Date;
  } | null;
  message?: string | null;
};

export class BarberAccessDeniedError extends Error {
  constructor(public status: BarberAccessStatus) {
    super(`Barber access denied${status.reason ? `: ${status.reason}` : ''}`);
    this.name = 'BarberAccessDeniedError';
  }

  get reason() {
    return this.status.reason;
  }
}

export async function getBarberAccessStatus(userId: string): Promise<BarberAccessStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, createdAt: true },
  });

  if (!user) {
    return {
      blocked: true,
      reason: 'NO_SUBSCRIPTION',
      trialEndsAt: null,
      trialDaysRemaining: null,
      subscription: null,
      message: BLOCKED_REASON_MESSAGES.NO_SUBSCRIPTION,
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      blocked: false,
      trialEndsAt: null,
      trialDaysRemaining: null,
      subscription: null,
      message: null,
    };
  }

  const now = new Date();
  const trialEndsAt = addDays(user.createdAt, TRIAL_DAYS);
  const trialDaysRemaining = Math.max(differenceInCalendarDays(trialEndsAt, now), 0);

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

  const trialStillValid = differenceInCalendarDays(trialEndsAt, now) >= 0;

  if (trialStillValid) {
    return {
      blocked: false,
      trialEndsAt,
      trialDaysRemaining,
      subscription: activeSubscription,
      message: null,
    };
  }

  if (activeSubscription) {
    return {
      blocked: false,
      trialEndsAt,
      trialDaysRemaining: 0,
      subscription: activeSubscription,
      message: null,
    };
  }

  return {
    blocked: true,
    reason: 'TRIAL_ENDED',
    trialEndsAt,
    trialDaysRemaining: 0,
    subscription: null,
    message: BLOCKED_REASON_MESSAGES.TRIAL_ENDED,
  };
}

export async function ensureBarberHasAccess(userId: string): Promise<BarberAccessStatus> {
  const status = await getBarberAccessStatus(userId);
  if (status.blocked) {
    throw new BarberAccessDeniedError(status);
  }
  return status;
}
