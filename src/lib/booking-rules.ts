/**
 * Pure booking business rules.
 *
 * These are intentionally free of Supabase/React so the same logic can be
 * unit-tested and mirrored by the SQL triggers in supabase/migrations.
 */

/** Sessions at or below this threshold flag the customer as critical. */
export const CRITICAL_SESSION_THRESHOLD = 2;

/** Cancellations at least this many minutes ahead restore the package credit. */
export const FREE_CANCELLATION_MINUTES = 30;

export const MS_PER_MINUTE = 60_000;

/**
 * Minutes between `now` and the appointment. Negative once the slot has passed.
 */
export function minutesUntil(scheduledAt: string | Date, now: Date = new Date()): number {
  const target = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  return (target.getTime() - now.getTime()) / MS_PER_MINUTE;
}

/**
 * Cancellation policy: a booking cancelled at least 30 minutes before the
 * appointment restores the deducted session; later than that it is forfeited.
 */
export function isRefundable(
  scheduledAt: string | Date,
  now: Date = new Date(),
): boolean {
  return minutesUntil(scheduledAt, now) >= FREE_CANCELLATION_MINUTES;
}

export interface CancellationOutcome {
  refundable: boolean;
  /** Sessions to add back to the customer package (0 or 1). */
  restoreSessions: number;
  minutesRemaining: number;
  /** Turkish explanation shown at the reception desk. */
  message_tr: string;
}

/**
 * Resolves what happens to the package credit when a booking is cancelled.
 * `packageWasDeducted` reflects whether the booking actually consumed a
 * session, so cash bookings never generate a phantom credit.
 */
export function resolveCancellation(
  scheduledAt: string | Date,
  packageWasDeducted: boolean,
  now: Date = new Date(),
): CancellationOutcome {
  const minutesRemaining = minutesUntil(scheduledAt, now);
  const refundable = minutesRemaining >= FREE_CANCELLATION_MINUTES;
  const restoreSessions = refundable && packageWasDeducted ? 1 : 0;

  let message_tr: string;
  if (!packageWasDeducted) {
    message_tr = "Randevu iptal edildi. Bu randevuda paket seansı kullanılmamıştı.";
  } else if (refundable) {
    message_tr = "Randevu iptal edildi. Paket seansı müşteriye iade edildi.";
  } else {
    message_tr =
      "Randevu iptal edildi. Randevuya 30 dakikadan az kaldığı için seans iade edilmedi.";
  }

  return { refundable, restoreSessions, minutesRemaining, message_tr };
}

/** True when the remaining balance should raise the red "critical" flag. */
export function isCriticalBalance(remainingSessions: number): boolean {
  return remainingSessions <= CRITICAL_SESSION_THRESHOLD;
}

export type BalanceLevel = "depleted" | "critical" | "low" | "healthy";

export function balanceLevel(remainingSessions: number): BalanceLevel {
  if (remainingSessions <= 0) return "depleted";
  if (remainingSessions <= CRITICAL_SESSION_THRESHOLD) return "critical";
  if (remainingSessions <= 4) return "low";
  return "healthy";
}

export const BALANCE_LABEL_TR: Record<BalanceLevel, string> = {
  depleted: "Paket Bitti",
  critical: "Kritik Seviye",
  low: "Azalıyor",
  healthy: "Yeterli",
};

/**
 * Whether a new booking may consume a session from this package.
 */
export function canDeductSession(pkg: {
  remaining_sessions: number;
  status: string;
}): boolean {
  return pkg.status === "active" && pkg.remaining_sessions > 0;
}

/** Applies the auto-deduction, returning the next package state. */
export function applyDeduction<T extends { remaining_sessions: number; status: string }>(
  pkg: T,
): T {
  const remaining = Math.max(0, pkg.remaining_sessions - 1);
  return {
    ...pkg,
    remaining_sessions: remaining,
    status: remaining === 0 ? "depleted" : pkg.status,
  };
}

/** Applies a refund, reactivating a package that had been depleted. */
export function applyRestore<T extends { remaining_sessions: number; status: string }>(
  pkg: T,
): T {
  return {
    ...pkg,
    remaining_sessions: pkg.remaining_sessions + 1,
    status: pkg.status === "depleted" ? "active" : pkg.status,
  };
}
