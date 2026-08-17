import type { Metadata } from "next";
import ReceptionDesk from "@/components/dashboard/ReceptionDesk";

/** `/desk` is an alias of `/reception` for tablets bookmarked to either URL. */
export const metadata: Metadata = {
  title: "Resepsiyon",
  description: "Reina Spa resepsiyon ve randevu takip ekranı.",
  robots: { index: false, follow: false },
};

export default function DeskPage() {
  return <ReceptionDesk />;
}
