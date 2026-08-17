"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import * as store from "./demo-store";
import { getSupabaseBrowserClient } from "./supabase/client";
import { balanceLevel, isCriticalBalance } from "./booking-rules";
import { isSameDay } from "./format";
import { useNow } from "./use-now";
import type { BookingWithRelations, CustomerPackageSummary } from "./types";

const EMPTY = store.getSnapshot();

/**
 * Single source of truth for the admin and reception screens.
 *
 * Reads from the in-memory demo store, and — when Supabase is configured —
 * attaches a realtime channel so bookings made on one device appear instantly
 * on the reception tablet.
 */
export function useOperations() {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => EMPTY,
  );

  // The dashboards are statically prerendered, so the server HTML would
  // otherwise freeze build-time dates ("12:08", "17 dk sonra") into the markup
  // and mismatch on hydration. `useNow` is null until hydration, then ticks
  // every 30s so relative labels stay truthful on a screen left open all day.
  const now = useNow();

  useEffect(() => {
    store.hydrateFromStorage();
  }, []);

  // Realtime: mirror Postgres changes into the local store.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("reina-ops")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          // The dashboards re-read from the store; a full refresh keeps the
          // demo path and the Supabase path on identical shapes.
          window.dispatchEvent(new CustomEvent("reina:refresh"));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_packages" },
        () => window.dispatchEvent(new CustomEvent("reina:refresh")),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

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

  /** Bookings enriched with customer/therapist/service, newest slot first. */
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
          (a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
        ),
    [state.bookings, customerById, therapistById, serviceById],
  );

  // Empty until mounted, so server and first client render agree.
  const todayBookings = useMemo(
    () => (now ? bookings.filter((b) => isSameDay(b.scheduled_at, now)) : []),
    [bookings, now],
  );

  /** Per-customer package balances, richest context first for the tables. */
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
    () => packageSummaries.filter((p) => isCriticalBalance(p.remaining_sessions)),
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

  return {
    ...state,
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
    createBooking: store.createBooking,
    cancelBooking: store.cancelBooking,
    updateBooking: store.updateBooking,
    createCustomer: store.createCustomer,
    assignPackage: store.assignPackage,
    activePackageFor: store.activePackageFor,
    upsertService: store.upsertService,
    removeService: store.removeService,
    upsertPackage: store.upsertPackage,
    removePackage: store.removePackage,
    upsertTherapist: store.upsertTherapist,
    toggleTherapist: store.toggleTherapist,
    upsertOffer: store.upsertOffer,
    removeOffer: store.removeOffer,
    resetDemoState: store.resetDemoState,
  };
}
