import { auth } from "@/lib/api";

export type BarberAccessResponse = Awaited<ReturnType<typeof auth.getAccessStatus>>;

const DEFAULT_BLOCKED_MESSAGE = "This barber is not accepting bookings right now.";

export async function fetchBarberAccessStatus(): Promise<BarberAccessResponse> {
  return auth.getAccessStatus();
}

export function canBookWithBarber(access?: BarberAccessResponse | null): boolean {
  if (!access) return true;
  return !access.blocked;
}

export function getBarberAccessBlockedMessage(access?: BarberAccessResponse | null): string | null {
  if (!access?.blocked) return null;
  return access.message ?? DEFAULT_BLOCKED_MESSAGE;
}
