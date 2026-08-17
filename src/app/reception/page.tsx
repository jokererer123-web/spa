import type { Metadata } from "next";
import ReceptionDesk from "@/components/dashboard/ReceptionDesk";
import { getStaffSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Resepsiyon",
  description: "Reina Spa resepsiyon ve randevu takip ekranı.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReceptionPage() {
  const user = await getStaffSession();
  return <ReceptionDesk user={user} />;
}
