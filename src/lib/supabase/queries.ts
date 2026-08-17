"use client";

/**
 * All Supabase reads and writes for the operations screens.
 *
 * Deliberately thin: the deduction and cancellation rules live in SQL triggers
 * (see supabase/migrations), so these functions only insert/update rows and let
 * the database enforce the business logic. That keeps a booking made from the
 * reception tablet, the admin panel or the SQL editor behaving identically.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Booking,
  CustomerPackage,
  Offer,
  Package,
  Profile,
  Service,
  Therapist,
} from "../types";

export interface OperationsSnapshot {
  bookings: Booking[];
  customers: Profile[];
  therapists: Therapist[];
  services: Service[];
  packages: Package[];
  customerPackages: CustomerPackage[];
  offers: Offer[];
}

/** Row shapes as returned by Postgres (numeric columns arrive as strings). */
type Row = Record<string, unknown>;

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};

function mapService(r: Row): Service {
  return {
    id: String(r.id),
    title_tr: String(r.title_tr ?? ""),
    description_tr: (r.description_tr as string) ?? "",
    duration_min: num(r.duration_min, 60),
    price: num(r.price),
    image_url: (r.image_url as string) ?? null,
    is_featured: Boolean(r.is_featured),
    sort_order: num(r.sort_order),
  };
}

function mapPackage(r: Row): Package {
  return {
    id: String(r.id),
    name_tr: String(r.name_tr ?? ""),
    description_tr: (r.description_tr as string) ?? "",
    total_sessions: num(r.total_sessions),
    price: num(r.price),
    is_featured: Boolean(r.is_featured),
    sort_order: num(r.sort_order),
  };
}

function mapTherapist(r: Row): Therapist {
  return {
    id: String(r.id),
    name: String(r.name ?? ""),
    specialization: (r.specialization as string) ?? "",
    active_status: Boolean(r.active_status),
  };
}

function mapCustomer(r: Row): Profile {
  return {
    id: String(r.id),
    full_name: String(r.full_name ?? ""),
    phone: (r.phone as string) ?? null,
    role: "client",
    created_at: String(r.created_at ?? new Date().toISOString()),
  };
}

function mapCustomerPackage(r: Row): CustomerPackage {
  return {
    id: String(r.id),
    customer_id: String(r.customer_id),
    package_id: String(r.package_id),
    remaining_sessions: num(r.remaining_sessions),
    status: (r.status as CustomerPackage["status"]) ?? "active",
    purchased_at: (r.purchased_at as string) ?? undefined,
    expires_at: (r.expires_at as string) ?? null,
  };
}

function mapBooking(r: Row): Booking {
  return {
    id: String(r.id),
    customer_id: String(r.customer_id),
    therapist_id: (r.therapist_id as string) ?? null,
    service_id: (r.service_id as string) ?? null,
    customer_package_id: (r.customer_package_id as string) ?? null,
    scheduled_at: String(r.scheduled_at),
    status: (r.status as Booking["status"]) ?? "confirmed",
    package_deducted_at: (r.package_deducted_at as string) ?? null,
    cancelled_at: (r.cancelled_at as string) ?? null,
    refunded: Boolean(r.refunded),
    notes: (r.notes as string) ?? null,
    created_at: String(r.created_at ?? new Date().toISOString()),
  };
}

function mapOffer(r: Row): Offer {
  return {
    id: String(r.id),
    title_tr: String(r.title_tr ?? ""),
    description_tr: (r.description_tr as string) ?? "",
    discount_label: String(r.discount_label ?? ""),
    valid_until: (r.valid_until as string) ?? null,
    highlight: Boolean(r.highlight),
  };
}

/**
 * Loads the whole operational dataset in parallel.
 *
 * The volumes here are small (a single spa's guests and appointments), so one
 * batched read keeps every screen consistent and makes realtime refresh a
 * single round trip rather than a cascade of dependent queries.
 */
export async function fetchAll(supabase: SupabaseClient): Promise<OperationsSnapshot> {
  const [services, packages, therapists, customers, customerPackages, bookings, offers] =
    await Promise.all([
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("packages").select("*").order("sort_order"),
      supabase.from("therapists").select("*").order("name"),
      supabase.from("customers").select("*").order("full_name"),
      supabase.from("customer_packages").select("*"),
      supabase.from("bookings").select("*").order("scheduled_at"),
      supabase.from("offers").select("*"),
    ]);

  const firstError = [
    services.error,
    packages.error,
    therapists.error,
    customers.error,
    customerPackages.error,
    bookings.error,
    offers.error,
  ].find(Boolean);
  if (firstError) throw firstError;

  return {
    services: (services.data ?? []).map(mapService),
    packages: (packages.data ?? []).map(mapPackage),
    therapists: (therapists.data ?? []).map(mapTherapist),
    customers: (customers.data ?? []).map(mapCustomer),
    customerPackages: (customerPackages.data ?? []).map(mapCustomerPackage),
    bookings: (bookings.data ?? []).map(mapBooking),
    offers: (offers.data ?? []).map(mapOffer),
  };
}

/** Marketing content only — readable without a session, for the public site. */
export async function fetchPublicContent(supabase: SupabaseClient) {
  const [services, packages, offers, therapists] = await Promise.all([
    supabase.from("services").select("*").order("sort_order"),
    supabase.from("packages").select("*").order("sort_order"),
    supabase.from("offers").select("*"),
    supabase.from("therapists").select("*").order("name"),
  ]);

  return {
    services: (services.data ?? []).map(mapService),
    packages: (packages.data ?? []).map(mapPackage),
    offers: (offers.data ?? []).map(mapOffer),
    therapists: (therapists.data ?? []).map(mapTherapist),
  };
}

/* ------------------------------------------------------------- mutations */

export interface CreateBookingRow {
  customer_id: string;
  therapist_id: string | null;
  service_id: string | null;
  customer_package_id: string | null;
  scheduled_at: string;
  notes: string | null;
}

/**
 * Inserts a confirmed booking. When `customer_package_id` is set the
 * `trg_bookings_deduct` trigger consumes one session and stamps
 * `package_deducted_at`, raising an exception if the package is empty.
 */
export async function insertBooking(
  supabase: SupabaseClient,
  row: CreateBookingRow,
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...row, status: "confirmed" })
    .select("*")
    .single();
  if (error) throw error;
  return mapBooking(data);
}

/**
 * Cancels a booking. `trg_bookings_cancel` decides whether the session is
 * restored based on the 30-minute window, so the client never computes it.
 */
export async function cancelBookingRow(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapBooking(data);
}

export async function updateBookingRow(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<Booking, "scheduled_at" | "therapist_id" | "service_id" | "notes" | "status">>,
) {
  const { error } = await supabase.from("bookings").update(patch).eq("id", id);
  if (error) throw error;
}

export async function insertCustomer(
  supabase: SupabaseClient,
  input: { full_name: string; phone: string },
): Promise<Profile> {
  const { data, error } = await supabase
    .from("customers")
    .insert({ full_name: input.full_name.trim(), phone: input.phone.trim() })
    .select("*")
    .single();
  if (error) throw error;
  return mapCustomer(data);
}

export async function insertCustomerPackage(
  supabase: SupabaseClient,
  customerId: string,
  packageId: string,
  totalSessions: number,
) {
  const { error } = await supabase.from("customer_packages").insert({
    customer_id: customerId,
    package_id: packageId,
    remaining_sessions: totalSessions,
    status: "active",
  });
  if (error) throw error;
}

/** Strips client-only ids so Postgres generates a uuid on insert. */
function withoutBlankId<T extends { id: string }>(row: T) {
  const { id, ...rest } = row;
  return id ? { ...rest, id } : rest;
}

export async function upsertServiceRow(supabase: SupabaseClient, service: Service) {
  const payload = withoutBlankId({
    id: service.id,
    title_tr: service.title_tr,
    description_tr: service.description_tr,
    duration_min: service.duration_min,
    price: service.price,
    is_featured: Boolean(service.is_featured),
    sort_order: service.sort_order ?? 0,
  });
  const { error } = await supabase.from("services").upsert(payload);
  if (error) throw error;
}

export async function deleteRow(supabase: SupabaseClient, table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function upsertPackageRow(supabase: SupabaseClient, pkg: Package) {
  const payload = withoutBlankId({
    id: pkg.id,
    name_tr: pkg.name_tr,
    description_tr: pkg.description_tr,
    total_sessions: pkg.total_sessions,
    price: pkg.price,
    is_featured: Boolean(pkg.is_featured),
    sort_order: pkg.sort_order ?? 0,
  });
  const { error } = await supabase.from("packages").upsert(payload);
  if (error) throw error;
}

export async function upsertTherapistRow(supabase: SupabaseClient, t: Therapist) {
  const payload = withoutBlankId({
    id: t.id,
    name: t.name,
    specialization: t.specialization,
    active_status: t.active_status,
  });
  const { error } = await supabase.from("therapists").upsert(payload);
  if (error) throw error;
}

export async function setTherapistActive(
  supabase: SupabaseClient,
  id: string,
  active: boolean,
) {
  const { error } = await supabase
    .from("therapists")
    .update({ active_status: active })
    .eq("id", id);
  if (error) throw error;
}

export async function upsertOfferRow(supabase: SupabaseClient, offer: Offer) {
  const payload = withoutBlankId({
    id: offer.id,
    title_tr: offer.title_tr,
    description_tr: offer.description_tr,
    discount_label: offer.discount_label,
    valid_until: offer.valid_until,
    highlight: Boolean(offer.highlight),
  });
  const { error } = await supabase.from("offers").upsert(payload);
  if (error) throw error;
}

/**
 * Turns a Postgres error into the Turkish message the desk should see.
 * Trigger exceptions (empty package) already carry a Turkish message.
 */
export function toTurkishError(error: unknown): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);

  if (/seans kalmadı|Paket bulunamadı/i.test(message)) return message;
  if (/row-level security|permission denied/i.test(message)) {
    return "Bu işlem için yetkiniz yok. Lütfen yönetici hesabıyla giriş yapın.";
  }
  if (/duplicate key/i.test(message)) return "Bu kayıt zaten mevcut.";
  if (/Failed to fetch|NetworkError/i.test(message)) {
    return "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
  }
  return `İşlem tamamlanamadı: ${message}`;
}
