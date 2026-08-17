import type { Metadata } from "next";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { getStaffSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  description: "Reina Spa yönetim paneli.",
  robots: { index: false, follow: false },
};

// The session lives in a cookie, so this route must be rendered per request.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getStaffSession();
  return <AdminDashboard user={user} />;
}
