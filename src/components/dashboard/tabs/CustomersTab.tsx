"use client";

import { useMemo, useState } from "react";
import { PackagePlus, Search, UserPlus, Users } from "lucide-react";
import { useOperations } from "@/lib/use-operations";
import { formatDate } from "@/lib/format";
import { BalanceBadge, Button, EmptyState, fieldClass, labelClass, Panel } from "../ui";

export default function CustomersTab() {
  const ops = useOperations();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [packageId, setPackageId] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [assignPkg, setAssignPkg] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return ops.customers
      .map((customer) => ({
        customer,
        packages: ops.packageSummaries.filter((p) => p.customer.id === customer.id),
        visits: ops.bookings.filter(
          (b) => b.customer_id === customer.id && b.status !== "cancelled",
        ).length,
      }))
      .filter(({ customer }) =>
        q
          ? `${customer.full_name} ${customer.phone ?? ""}`.toLocaleLowerCase("tr").includes(q)
          : true,
      );
  }, [ops.customers, ops.packageSummaries, ops.bookings, query]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    try {
      await ops.createCustomer({ full_name: name, phone, packageId: packageId || null });
      setMessage(`${name} kaydedildi.`);
      setName("");
      setPhone("");
      setPackageId("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Misafir kaydedilemedi.");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTo || !assignPkg) return;
    const res = await ops.assignPackage(assignTo, assignPkg);
    setMessage(res.message_tr);
    setAssignPkg("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Panel title={`Misafirler (${rows.length})`} icon={Users}>
        <div className="relative border-b border-white/8 px-5 py-3">
          <Search className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya telefon ara…"
            className={`${fieldClass} pl-10`}
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState>Misafir bulunamadı.</EmptyState>
        ) : (
          <ul className="max-h-[64vh] divide-y divide-white/5 overflow-y-auto">
            {rows.map(({ customer, packages, visits }) => (
              <li key={customer.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-wine-700/50 bg-wine-900/30 font-display text-lg text-rose-soft">
                  {customer.full_name.charAt(0)}
                </span>
                <div className="min-w-[9rem] flex-1">
                  <p className="text-sm font-semibold text-white">{customer.full_name}</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {customer.phone} · {visits} ziyaret · üyelik{" "}
                    {formatDate(customer.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {packages.length === 0 ? (
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.66rem] text-white/35">
                      Paket yok
                    </span>
                  ) : (
                    packages.map((p) => (
                      <span key={p.customer_package_id} className="flex items-center gap-2">
                        <span className="text-[0.66rem] text-white/35">{p.package_name}</span>
                        <BalanceBadge remaining={p.remaining_sessions} />
                      </span>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="space-y-6">
        <Panel title="Yeni Misafir" icon={UserPlus}>
          <form onSubmit={handleCreate} className="space-y-4 p-5">
            <div>
              <label htmlFor="c-name" className={labelClass}>
                Ad Soyad
              </label>
              <input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Misafir adı"
                required
              />
            </div>
            <div>
              <label htmlFor="c-phone" className={labelClass}>
                Telefon
              </label>
              <input
                id="c-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                placeholder="05XX XXX XX XX"
                required
              />
            </div>
            <div>
              <label htmlFor="c-package" className={labelClass}>
                Başlangıç Paketi
              </label>
              <select
                id="c-package"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Paket yok</option>
                {ops.packages.map((p) => (
                  <option key={p.id} value={p.id} className="bg-ink-900">
                    {p.name_tr} ({p.total_sessions} seans)
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full py-3.5">
              <UserPlus className="h-4 w-4" />
              Misafiri Kaydet
            </Button>
          </form>
        </Panel>

        <Panel title="Paket Tanımla" icon={PackagePlus}>
          <form onSubmit={handleAssign} className="space-y-4 p-5">
            <div>
              <label htmlFor="a-customer" className={labelClass}>
                Misafir
              </label>
              <select
                id="a-customer"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className={fieldClass}
                required
              >
                <option value="">Misafir seçin…</option>
                {ops.customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-900">
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="a-package" className={labelClass}>
                Paket
              </label>
              <select
                id="a-package"
                value={assignPkg}
                onChange={(e) => setAssignPkg(e.target.value)}
                className={fieldClass}
                required
              >
                <option value="">Paket seçin…</option>
                {ops.packages.map((p) => (
                  <option key={p.id} value={p.id} className="bg-ink-900">
                    {p.name_tr} ({p.total_sessions} seans)
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="ghost" className="w-full py-3.5">
              Paketi Tanımla
            </Button>
            {message && <p className="text-center text-xs text-emerald-400">{message}</p>}
          </form>
        </Panel>
      </div>
    </div>
  );
}
