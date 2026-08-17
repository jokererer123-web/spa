"use client";

/**
 * In-memory operations store used whenever Supabase is not configured.
 *
 * It implements exactly the same rules as the SQL layer (auto-deduction on
 * confirm, 30-minute refund window on cancel, critical-balance flagging) and
 * broadcasts changes to every subscriber, so the admin and reception screens
 * stay in sync the same way the realtime channel does in production.
 */
import {
  applyDeduction,
  applyRestore,
  canDeductSession,
  resolveCancellation,
} from "./booking-rules";
import {
  CUSTOMER_PACKAGES,
  CUSTOMERS,
  OFFERS,
  PACKAGES,
  SERVICES,
  seedBookings,
  THERAPISTS,
} from "./demo-data";
import type {
  Booking,
  CustomerPackage,
  Offer,
  Package,
  Profile,
  Service,
  Therapist,
} from "./types";

export interface OperationsState {
  bookings: Booking[];
  customers: Profile[];
  therapists: Therapist[];
  services: Service[];
  packages: Package[];
  customerPackages: CustomerPackage[];
  offers: Offer[];
}

const STORAGE_KEY = "reina-spa-demo-state-v1";

function initialState(): OperationsState {
  return {
    bookings: seedBookings(),
    customers: [...CUSTOMERS],
    therapists: [...THERAPISTS],
    services: [...SERVICES],
    packages: [...PACKAGES],
    customerPackages: CUSTOMER_PACKAGES.map((p) => ({ ...p })),
    offers: [...OFFERS],
  };
}

let state: OperationsState = initialState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — demo data simply resets on reload */
    }
  }
}

/** Restores a previous demo session once, on first client read. */
export function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<OperationsState>;
    if (parsed?.bookings?.length) {
      state = { ...state, ...parsed } as OperationsState;
      emit();
    }
  } catch {
    /* corrupt payload — keep the fresh seed */
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): OperationsState {
  return state;
}

function set(update: Partial<OperationsState>) {
  state = { ...state, ...update };
  emit();
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------------------------------------- bookings */

export interface CreateBookingInput {
  customer_id: string;
  therapist_id: string | null;
  service_id: string | null;
  scheduled_at: string;
  notes?: string | null;
  /** Consume a session from the customer's active package. */
  usePackage: boolean;
}

export interface MutationResult {
  ok: boolean;
  message_tr: string;
  booking?: Booking;
}

export function activePackageFor(customerId: string): CustomerPackage | undefined {
  return state.customerPackages.find(
    (p) => p.customer_id === customerId && p.status === "active" && p.remaining_sessions > 0,
  );
}

export function createBooking(input: CreateBookingInput): MutationResult {
  const now = new Date().toISOString();
  let customerPackageId: string | null = null;
  let deductedAt: string | null = null;

  if (input.usePackage) {
    const pkg = activePackageFor(input.customer_id);
    if (!pkg || !canDeductSession(pkg)) {
      return {
        ok: false,
        message_tr:
          "Bu misafirin kullanılabilir paket seansı yok. Lütfen yeni paket tanımlayın veya tek seans olarak kaydedin.",
      };
    }
    // Auto-deduction: confirming a booking consumes exactly one session.
    set({
      customerPackages: state.customerPackages.map((p) =>
        p.id === pkg.id ? applyDeduction(p) : p,
      ),
    });
    customerPackageId = pkg.id;
    deductedAt = now;
  }

  const booking: Booking = {
    id: uid("bk"),
    customer_id: input.customer_id,
    therapist_id: input.therapist_id,
    service_id: input.service_id,
    customer_package_id: customerPackageId,
    scheduled_at: input.scheduled_at,
    status: "confirmed",
    package_deducted_at: deductedAt,
    refunded: false,
    notes: input.notes ?? null,
    created_at: now,
  };

  set({ bookings: [...state.bookings, booking] });
  return {
    ok: true,
    booking,
    message_tr: deductedAt
      ? "Randevu oluşturuldu ve paketten 1 seans düşüldü."
      : "Randevu oluşturuldu.",
  };
}

export function cancelBooking(bookingId: string): MutationResult {
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false, message_tr: "Randevu bulunamadı." };
  if (booking.status === "cancelled") {
    return { ok: false, message_tr: "Bu randevu zaten iptal edilmiş." };
  }

  const outcome = resolveCancellation(
    booking.scheduled_at,
    Boolean(booking.package_deducted_at),
  );

  const customerPackages =
    outcome.restoreSessions > 0 && booking.customer_package_id
      ? state.customerPackages.map((p) =>
          p.id === booking.customer_package_id ? applyRestore(p) : p,
        )
      : state.customerPackages;

  set({
    customerPackages,
    bookings: state.bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            refunded: outcome.restoreSessions > 0,
            package_deducted_at: outcome.restoreSessions > 0 ? null : b.package_deducted_at,
          }
        : b,
    ),
  });

  return { ok: true, message_tr: outcome.message_tr };
}

export function updateBooking(
  bookingId: string,
  patch: Partial<Pick<Booking, "scheduled_at" | "therapist_id" | "service_id" | "notes" | "status">>,
): MutationResult {
  const exists = state.bookings.some((b) => b.id === bookingId);
  if (!exists) return { ok: false, message_tr: "Randevu bulunamadı." };
  set({
    bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, ...patch } : b)),
  });
  return { ok: true, message_tr: "Randevu güncellendi." };
}

/* ------------------------------------------------------------ customers */

export function createCustomer(input: {
  full_name: string;
  phone: string;
  packageId?: string | null;
}): Profile {
  const customer: Profile = {
    id: uid("c"),
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    role: "client",
    created_at: new Date().toISOString(),
  };
  const next: Partial<OperationsState> = { customers: [...state.customers, customer] };

  if (input.packageId) {
    const pkg = state.packages.find((p) => p.id === input.packageId);
    if (pkg) {
      next.customerPackages = [
        ...state.customerPackages,
        {
          id: uid("cp"),
          customer_id: customer.id,
          package_id: pkg.id,
          remaining_sessions: pkg.total_sessions,
          status: "active",
          purchased_at: new Date().toISOString(),
        },
      ];
    }
  }
  set(next);
  return customer;
}

export function assignPackage(customerId: string, packageId: string): MutationResult {
  const pkg = state.packages.find((p) => p.id === packageId);
  if (!pkg) return { ok: false, message_tr: "Paket bulunamadı." };
  set({
    customerPackages: [
      ...state.customerPackages,
      {
        id: uid("cp"),
        customer_id: customerId,
        package_id: pkg.id,
        remaining_sessions: pkg.total_sessions,
        status: "active",
        purchased_at: new Date().toISOString(),
      },
    ],
  });
  return { ok: true, message_tr: `${pkg.name_tr} tanımlandı (${pkg.total_sessions} seans).` };
}

/* ------------------------------------------------- admin content editing */

export function upsertService(service: Service) {
  const exists = state.services.some((s) => s.id === service.id);
  set({
    services: exists
      ? state.services.map((s) => (s.id === service.id ? service : s))
      : [...state.services, { ...service, id: service.id || uid("svc") }],
  });
}

export function removeService(id: string) {
  set({ services: state.services.filter((s) => s.id !== id) });
}

export function upsertPackage(pkg: Package) {
  const exists = state.packages.some((p) => p.id === pkg.id);
  set({
    packages: exists
      ? state.packages.map((p) => (p.id === pkg.id ? pkg : p))
      : [...state.packages, { ...pkg, id: pkg.id || uid("pkg") }],
  });
}

export function removePackage(id: string) {
  set({ packages: state.packages.filter((p) => p.id !== id) });
}

export function upsertTherapist(therapist: Therapist) {
  const exists = state.therapists.some((t) => t.id === therapist.id);
  set({
    therapists: exists
      ? state.therapists.map((t) => (t.id === therapist.id ? therapist : t))
      : [...state.therapists, { ...therapist, id: therapist.id || uid("th") }],
  });
}

export function toggleTherapist(id: string) {
  set({
    therapists: state.therapists.map((t) =>
      t.id === id ? { ...t, active_status: !t.active_status } : t,
    ),
  });
}

export function upsertOffer(offer: Offer) {
  const exists = state.offers.some((o) => o.id === offer.id);
  set({
    offers: exists
      ? state.offers.map((o) => (o.id === offer.id ? offer : o))
      : [...state.offers, { ...offer, id: offer.id || uid("off") }],
  });
}

export function removeOffer(id: string) {
  set({ offers: state.offers.filter((o) => o.id !== id) });
}

export function resetDemoState() {
  state = initialState();
  emit();
}
