import type { Metadata } from "next";
import ReceptionDesk from "@/components/dashboard/ReceptionDesk";
import { getStaffSession } from "@/lib/supabase/auth";

/** `/desk` is an alias of `/reception` for tablets bookmarked to either URL. */
export const metadata: Metadata = {
  title: "Resepsiyon",
  description: "Reina Spa resepsiyon ve randevu takip ekranı.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DeskPage() {
  const user = await getStaffSession();
  return <ReceptionDesk user={user} />;
}
