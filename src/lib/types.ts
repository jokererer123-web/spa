export type Role = "admin" | "receptionist" | "client";

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";

export type CustomerPackageStatus = "active" | "depleted" | "expired";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  notes?: string | null;
  created_at: string;
}

export interface Therapist {
  id: string;
  name: string;
  specialization: string | null;
  active_status: boolean;
  created_at?: string;
}

export interface Service {
  id: string;
  title_tr: string;
  description_tr: string | null;
  duration_min: number;
  price: number;
  image_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
}

export interface Package {
  id: string;
  name_tr: string;
  description_tr?: string | null;
  total_sessions: number;
  price: number;
  is_featured?: boolean;
  sort_order?: number;
}

export interface CustomerPackage {
  id: string;
  customer_id: string;
  package_id: string;
  remaining_sessions: number;
  status: CustomerPackageStatus;
  purchased_at?: string;
  expires_at?: string | null;
}

export interface Booking {
  id: string;
  customer_id: string;
  therapist_id: string | null;
  service_id: string | null;
  customer_package_id?: string | null;
  scheduled_at: string;
  status: BookingStatus;
  package_deducted_at: string | null;
  cancelled_at?: string | null;
  refunded: boolean;
  notes?: string | null;
  created_at: string;
}

/** A booking joined with the display names the desk UI needs. */
export interface BookingWithRelations extends Booking {
  customer?: Pick<Profile, "id" | "full_name" | "phone"> | null;
  therapist?: Pick<Therapist, "id" | "name"> | null;
  service?: Pick<Service, "id" | "title_tr" | "duration_min" | "price"> | null;
}

/** Aggregated per-customer package state used by the critical-level list. */
export interface CustomerPackageSummary {
  customer: Profile;
  package_name: string;
  customer_package_id: string;
  remaining_sessions: number;
  total_sessions: number;
  status: CustomerPackageStatus;
}

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  title_tr: string;
  category: string;
}

export interface Offer {
  id: string;
  title_tr: string;
  description_tr: string;
  discount_label: string;
  valid_until: string | null;
  highlight?: boolean;
}
