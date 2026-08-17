"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  CalendarDays,
  Gauge,
  LayoutGrid,
  Package as PackageIcon,
  RotateCcw,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import OverviewTab from "./tabs/OverviewTab";
import BookingsTab from "./tabs/BookingsTab";
import CustomersTab from "./tabs/CustomersTab";
import ServicesTab from "./tabs/ServicesTab";
import PackagesTab from "./tabs/PackagesTab";
import TherapistsTab from "./tabs/TherapistsTab";
import OffersTab from "./tabs/OffersTab";
import { Button } from "./ui";

const TABS = [
  { key: "overview", label: "Genel Bakış", icon: Gauge },
  { key: "bookings", label: "Randevular", icon: CalendarDays },
  { key: "customers", label: "Misafirler", icon: Users },
  { key: "services", label: "Hizmetler", icon: LayoutGrid },
  { key: "packages", label: "Paketler", icon: PackageIcon },
  { key: "therapists", label: "Terapistler", icon: Sparkles },
  { key: "offers", label: "Fırsatlar", icon: BadgePercent },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Owner admin panel: full control over content, staff, guests and bookings. */
export default function AdminDashboard() {
  const ops = useOperations();
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="min-h-screen bg-ink-900">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-[0.2em] text-gradient-rose">
                REINA
              </span>
              <span className="text-[0.56rem] uppercase tracking-[0.34em] text-white/40">
                Yönetim Paneli
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Demo verileri sıfırlansın mı?")) ops.resetDemoState();
              }}
              className="!px-4 !py-2 !text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Demo Sıfırla</span>
            </Button>
            <Link
              href="/reception"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-crimson-500 hover:text-white"
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resepsiyon</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto max-w-[1600px] px-5 lg:px-8">
          <ul className="flex gap-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    tab === item.key ? "text-white" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  {tab === item.key && (
                    <motion.span
                      layoutId="admin-tab"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-wine-700 to-crimson-600"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <item.icon className="relative h-3.5 w-3.5" />
                  <span className="relative whitespace-nowrap">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {tab === "overview" && <OverviewTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "customers" && <CustomersTab />}
            {tab === "services" && <ServicesTab />}
            {tab === "packages" && <PackagesTab />}
            {tab === "therapists" && <TherapistsTab />}
            {tab === "offers" && <OffersTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
