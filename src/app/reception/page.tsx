import type { Metadata } from "next";
import ReceptionDesk from "@/components/dashboard/ReceptionDesk";

export const metadata: Metadata = {
  title: "Resepsiyon",
  description: "Reina Spa resepsiyon ve randevu takip ekranı.",
  robots: { index: false, follow: false },
};

export default function ReceptionPage() {
  return <ReceptionDesk />;
}
