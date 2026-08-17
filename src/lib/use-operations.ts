"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as store from "./demo-store";
import { getSupabaseBrowserClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";
import * as db from "./supabase/queries";
import { balanceLevel, isCriticalBalance } from "./booking-rules";
import { isSameDay } from "./format";
import { useNow } from "./use-now";
import type {
  Booking,
  BookingWithRelations,
  CustomerPackageSummary,
  Offer,
  Package,
  Service,
  Therapist,
} from "./types";

const EMPTY = store.getSnapshot();

/** Fields the desk may edit on an existing booking. */
export type BookingPatch = Partial<
  Pick<Booking, "scheduled_at" | "therapist_id" | "service_id" | "notes" | "status">
>;

export interface MutationResult {
  ok: boolean;
  message_tr: string;
  booking?: Booking;
}

/**
 * Single source of truth for the admin and reception screens.
 *
 * When Supabase is configured every read and write goes to Postgres, and a
 * realtime subscription refetches whenever another device changes a booking or
 * a package balance. Without credentials the hook transparently falls back to
 * the in-memory demo store so the UI stays fully explorable.
 *
 * Business rules are never duplicated here: against Supabase the SQL triggers
 * own deduction and the 30-minute refund window; against the demo store the
 * equivalent pure functions in booking-rules.ts do.
 */
export function useOperations() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const live = Boolean(supabase);

  // Demo path state.
  const demoState = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);

  // Supabase path state.
  const [remote, setRemote] = useState<db.OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The dashboards are statically prerendered, so the server HTML would
  // otherwise freeze build-time dates ("12:08", "17 dk sonra") into the markup
  // and mismatch on hydration. `useNow` is null until hydration, then ticks
  // every 30s so relative labels stay truthful on a screen left open all day.
  const now = useNow();

  const reload = useCallback(async () => {
    if (!supabase) return;
    try {
      const snapshot = await db.fetchAll(supabase);
      setRemote(snapshot);
      setError(null);
    } catch (e) {
      setError(db.toTurkishError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /** Coalesces bursts of realtime events into a single refetch. */
  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => void reload(), 180);
  }, [reload]);

  useEffect(() => {
    if (!supabase) {
      store.hydrateFromStorage();
      return;
    }
    let cancelled = false;
    db.fetchAll(supabase)
      .then((snapshot) => {
        if (cancelled) return;
        setRemote(snapshot);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(db.toTurkishError(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Realtime: any change from another device refreshes this screen.
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("reina-ops")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, scheduleReload)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_packages" },
        scheduleReload,
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "therapists" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, scheduleReload)
      .subscribe();

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [supabase, scheduleReload]);

  const state = live ? (remote ?? EMPTY_REMOTE) : demoState;

  /* ------------------------------------------------------------ indexes */

  const serviceById = useMemo(
    () => new Map(state.services.map((s) => [s.id, s])),
    [state.services],
  );
  const therapistById = useMemo(
    () => new Map(state.therapists.map((t) => [t.id, t])),
    [state.therapists],
  );
  const customerById = useMemo(
    () => new Map(state.customers.map((c) => [c.id, c])),
    [state.customers],
  );
  const packageById = useMemo(
    () => new Map(state.packages.map((p) => [p.id, p])),
    [state.packages],
  );

  const bookings = useMemo<BookingWithRelations[]>(
    () =>
      state.bookings
        .map((b) => ({
          ...b,
          customer: customerById.get(b.customer_id) ?? null,
          therapist: b.therapist_id ? (therapistById.get(b.therapist_id) ?? null) : null,
          service: b.service_id ? (serviceById.get(b.service_id) ?? null) : null,
        }))
        .sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
        ),
    [state.bookings, customerById, therapistById, serviceById],
  );

  // Empty until mounted, so server and first client render agree.
  const todayBookings = useMemo(
    () => (now ? bookings.filter((b) => isSameDay(b.scheduled_at, now)) : []),
    [bookings, now],
  );

  const packageSummaries = useMemo<CustomerPackageSummary[]>(
    () =>
      state.customerPackages
        .map((cp) => {
          const customer = customerById.get(cp.customer_id);
          const pkg = packageById.get(cp.package_id);
          if (!customer) return null;
          return {
            customer,
            customer_package_id: cp.id,
            package_name: pkg?.name_tr ?? "Paket",
            remaining_sessions: cp.remaining_sessions,
            total_sessions: pkg?.total_sessions ?? cp.remaining_sessions,
            status: cp.status,
          } satisfies CustomerPackageSummary;
        })
        .filter((x): x is CustomerPackageSummary => x !== null)
        .sort((a, b) => a.remaining_sessions - b.remaining_sessions),
    [state.customerPackages, customerById, packageById],
  );

  /** Red-flag list: balances at or below the critical threshold. */
  const criticalPackages = useMemo(
    () =>
      packageSummaries.filter(
        (p) => p.status === "active" && isCriticalBalance(p.remaining_sessions),
      ),
    [packageSummaries],
  );

  const stats = useMemo(() => {
    const confirmed = todayBookings.filter((b) => b.status === "confirmed");
    const revenue = todayBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (b.service?.price ?? 0), 0);
    return {
      todayTotal: todayBookings.length,
      todayConfirmed: confirmed.length,
      todayCancelled: todayBookings.filter((b) => b.status === "cancelled").length,
      activeTherapists: state.therapists.filter((t) => t.active_status).length,
      criticalCount: criticalPackages.length,
      customers: state.customers.length,
      revenue,
    };
  }, [todayBookings, state.therapists, state.customers, criticalPackages]);

  const levelFor = useCallback((remaining: number) => balanceLevel(remaining), []);

  const activePackageFor = useCallback(
    (customerId: string) =>
      state.customerPackages.find(
        (p) => p.customer_id === customerId && p.status === "active" && p.remaining_sessions > 0,
      ),
    [state.customerPackages],
  );

  /* ---------------------------------------------------------- mutations */

  const createBooking = useCallback(
    async (input: {
      customer_id: string;
      therapist_id: string | null;
      service_id: string | null;
      scheduled_at: string;
      notes?: string | null;
      usePackage: boolean;
    }): Promise<MutationResult> => {
      if (!supabase) return store.createBooking(input);

      let customerPackageId: string | null = null;
      if (input.usePackage) {
        const pkg = activePackageFor(input.customer_id);
        if (!pkg) {
          return {
            ok: false,
            message_tr:
              "Bu misafirin kullanılabilir paket seansı yok. Lütfen yeni paket tanımlayın veya tek seans olarak kaydedin.",
          };
        }
        customerPackageId = pkg.id;
      }

      try {
        // The insert trigger performs the deduction atomically.
        const booking = await db.insertBooking(supabase, {
          customer_id: input.customer_id,
          therapist_id: input.therapist_id,
          service_id: input.service_id,
          customer_package_id: customerPackageId,
          scheduled_at: input.scheduled_at,
          notes: input.notes ?? null,
        });
        await reload();
        return {
          ok: true,
          booking,
          message_tr: booking.package_deducted_at
            ? "Randevu oluşturuldu ve paketten 1 seans düşüldü."
            : "Randevu oluşturuldu.",
        };
      } catch (e) {
        return { ok: false, message_tr: db.toTurkishError(e) };
      }
    },
    [supabase, activePackageFor, reload],
  );

  const cancelBooking = useCallback(
    async (id: string): Promise<MutationResult> => {
      if (!supabase) return store.cancelBooking(id);
      try {
        // The update trigger applies the 30-minute refund policy and reports
        // back through `refunded`, so the wording always matches what the
        // database actually did.
        const booking = await db.cancelBookingRow(supabase, id);
        await reload();
        return {
          ok: true,
          message_tr: booking.refunded
            ? "Randevu iptal edildi. Paket seansı müşteriye iade edildi."
            : "Randevu iptal edildi. Randevuya 30 dakikadan az kaldığı için seans iade edilmedi.",
        };
      } catch (e) {
        return { ok: false, message_tr: db.toTurkishError(e) };
      }
    },
    [supabase, reload],
  );

  const updateBooking = useCallback(
    async (id: string, patch: BookingPatch) => {
      if (!supabase) return store.updateBooking(id, patch);
      try {
        await db.updateBookingRow(supabase, id, patch);
        await reload();
        return { ok: true, message_tr: "Randevu güncellendi." };
      } catch (e) {
        return { ok: false, message_tr: db.toTurkishError(e) };
      }
    },
    [supabase, reload],
  );

  const createCustomer = useCallback(
    async (input: { full_name: string; phone: string; packageId?: string | null }) => {
      if (!supabase) return store.createCustomer(input);
      const customer = await db.insertCustomer(supabase, input);
      if (input.packageId) {
        const pkg = packageById.get(input.packageId);
        if (pkg) {
          await db.insertCustomerPackage(
            supabase,
            customer.id,
            pkg.id,
            pkg.total_sessions,
          );
        }
      }
      await reload();
      return customer;
    },
    [supabase, packageById, reload],
  );

  const assignPackage = useCallback(
    async (customerId: string, packageId: string): Promise<MutationResult> => {
      if (!supabase) return store.assignPackage(customerId, packageId);
      const pkg = packageById.get(packageId);
      if (!pkg) return { ok: false, message_tr: "Paket bulunamadı." };
      try {
        await db.insertCustomerPackage(supabase, customerId, pkg.id, pkg.total_sessions);
        await reload();
        return {
          ok: true,
          message_tr: `${pkg.name_tr} tanımlandı (${pkg.total_sessions} seans).`,
        };
      } catch (e) {
        return { ok: false, message_tr: db.toTurkishError(e) };
      }
    },
    [supabase, packageById, reload],
  );

  /** Wraps a content mutation so both backends share one call signature. */
  const contentMutation = useCallback(
    <A extends unknown[]>(
      demoFn: (...args: A) => void,
      liveFn: (client: NonNullable<typeof supabase>, ...args: A) => Promise<void>,
    ) =>
      async (...args: A) => {
        if (!supabase) {
          demoFn(...args);
          return;
        }
        try {
          await liveFn(supabase, ...args);
          await reload();
        } catch (e) {
          setError(db.toTurkishError(e));
        }
      },
    [supabase, reload],
  );

  const upsertService = useMemo(
    () => contentMutation(store.upsertService, (c, s: Service) => db.upsertServiceRow(c, s)),
    [contentMutation],
  );
  const removeService = useMemo(
    () => contentMutation(store.removeService, (c, id: string) => db.deleteRow(c, "services", id)),
    [contentMutation],
  );
  const upsertPackage = useMemo(
    () => contentMutation(store.upsertPackage, (c, p: Package) => db.upsertPackageRow(c, p)),
    [contentMutation],
  );
  const removePackage = useMemo(
    () => contentMutation(store.removePackage, (c, id: string) => db.deleteRow(c, "packages", id)),
    [contentMutation],
  );
  const upsertTherapist = useMemo(
    () => contentMutation(store.upsertTherapist, (c, t: Therapist) => db.upsertTherapistRow(c, t)),
    [contentMutation],
  );
  const upsertOffer = useMemo(
    () => contentMutation(store.upsertOffer, (c, o: Offer) => db.upsertOfferRow(c, o)),
    [contentMutation],
  );
  const removeOffer = useMemo(
    () => contentMutation(store.removeOffer, (c, id: string) => db.deleteRow(c, "offers", id)),
    [contentMutation],
  );

  const toggleTherapist = useCallback(
    async (id: string) => {
      if (!supabase) {
        store.toggleTherapist(id);
        return;
      }
      const current = therapistById.get(id);
      if (!current) return;
      try {
        await db.setTherapistActive(supabase, id, !current.active_status);
        await reload();
      } catch (e) {
        setError(db.toTurkishError(e));
      }
    },
    [supabase, therapistById, reload],
  );

  return {
    ...state,
    /** True when reads and writes are going to Supabase. */
    live,
    loading,
    error,
    reload,
    /** Null until mounted on the client; guards time-dependent rendering. */
    now,
    mounted: now !== null,
    bookings,
    todayBookings,
    packageSummaries,
    criticalPackages,
    stats,
    levelFor,
    serviceById,
    therapistById,
    customerById,
    packageById,
    // mutations
    createBooking,
    cancelBooking,
    updateBooking,
    createCustomer,
    assignPackage,
    activePackageFor,
    upsertService,
    removeService,
    upsertPackage,
    removePackage,
    upsertTherapist,
    toggleTherapist,
    upsertOffer,
    removeOffer,
    resetDemoState: store.resetDemoState,
    isSupabaseConfigured,
  };
}

/** Stable empty snapshot so the Supabase path renders before data arrives. */
const EMPTY_REMOTE: db.OperationsSnapshot = {
  bookings: [],
  customers: [],
  therapists: [],
  services: [],
  packages: [],
  customerPackages: [],
  offers: [],
};
