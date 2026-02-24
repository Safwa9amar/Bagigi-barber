import { SubscriptionPlan } from '@prisma/client';
import prisma from '@/lib/prisma';
import { addMonths, addYears } from 'date-fns';

const PLAN_PRICING: Record<SubscriptionPlan, number> = {
  MONTHLY: 2500,
  YEARLY: 25000,
};

export function parsePlan(input: unknown): SubscriptionPlan | null {
  if (typeof input !== 'string') return null;
  const normalized = input.toUpperCase();
  if (normalized !== 'MONTHLY' && normalized !== 'YEARLY') return null;
  return normalized as SubscriptionPlan;
}

export function getPlanPrice(plan: SubscriptionPlan): number {
  return PLAN_PRICING[plan];
}

export function getPlanEndDate(plan: SubscriptionPlan, startDate: Date): Date {
  if (plan === 'MONTHLY') return addMonths(startDate, 1);
  return addYears(startDate, 1);
}

export async function expireOutdatedSubscriptions(userId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
      endsAt: { lt: new Date() },
    },
    data: {
      status: 'EXPIRED',
    },
  });
}
