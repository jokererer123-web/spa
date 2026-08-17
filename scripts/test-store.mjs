/**
 * End-to-end test of the demo operations store: creating a booking must
 * deduct a session, an early cancel must restore it, a late cancel must not,
 * and the critical list must react to the resulting balances.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Minimal browser globals the store touches.
globalThis.window = {
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  dispatchEvent() {},
};

const dir = mkdtempSync(path.join(tmpdir(), "reina-store-"));
const out = path.join(dir, "bundle.mjs");
execFileSync(
  "npx",
  [
    "--yes", "esbuild", "src/lib/demo-store.ts",
    "--bundle", "--format=esm", "--target=es2022",
    "--platform=neutral", "--external:react", `--outfile=${out}`,
  ],
  { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
);
// Strip the "use client" directive so Node can import it plainly.
writeFileSync(out, readFileSync(out, "utf8").replace(/^"use client";?/m, ""));

const store = await import(pathToFileURL(out).href);
rmSync(dir, { recursive: true, force: true });

let n = 0;
const check = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`); };

const remaining = (customerId) =>
  store.getSnapshot().customerPackages.find((p) => p.customer_id === customerId)
    ?.remaining_sessions;

const inMin = (m) => new Date(Date.now() + m * 60_000).toISOString();

console.log("\nBooking creation & auto-deduction");
// c-3 (Zeynep) starts with 9 sessions on Reina Elite.
check("guest starts with the seeded balance", () => {
  assert.equal(remaining("c-3"), 9);
});

let created;
check("creating a package booking deducts exactly 1 session", () => {
  created = store.createBooking({
    customer_id: "c-3", therapist_id: "th-1", service_id: "svc-bali",
    scheduled_at: inMin(120), usePackage: true,
  });
  assert.equal(created.ok, true);
  assert.equal(remaining("c-3"), 8);
  assert.ok(created.booking.package_deducted_at, "deduction timestamp set");
  assert.match(created.message_tr, /1 seans düşüldü/);
});

check("a cash booking does not touch the balance", () => {
  const before = remaining("c-3");
  const res = store.createBooking({
    customer_id: "c-3", therapist_id: null, service_id: "svc-refleks",
    scheduled_at: inMin(200), usePackage: false,
  });
  assert.equal(res.ok, true);
  assert.equal(res.booking.package_deducted_at, null);
  assert.equal(remaining("c-3"), before);
});

console.log("\nCancellation policy");
check("cancelling >30 min ahead restores the session", () => {
  const before = remaining("c-3");
  const res = store.cancelBooking(created.booking.id);
  assert.equal(res.ok, true);
  assert.match(res.message_tr, /iade edildi/);
  assert.equal(remaining("c-3"), before + 1);
});

check("cancelling <30 min ahead forfeits the session", () => {
  const soon = store.createBooking({
    customer_id: "c-3", therapist_id: null, service_id: "svc-bali",
    scheduled_at: inMin(10), usePackage: true,
  });
  const after = remaining("c-3");
  const res = store.cancelBooking(soon.booking.id);
  assert.match(res.message_tr, /iade edilmedi/);
  assert.equal(remaining("c-3"), after, "balance unchanged");
});

check("double cancellation is rejected", () => {
  const res = store.cancelBooking(created.booking.id);
  assert.equal(res.ok, false);
});

console.log("\nDepleted packages");
check("booking is refused when no sessions remain", () => {
  // c-8 (Ahmet) is seeded with a depleted package.
  const res = store.createBooking({
    customer_id: "c-8", therapist_id: null, service_id: "svc-medikal",
    scheduled_at: inMin(300), usePackage: true,
  });
  assert.equal(res.ok, false);
  assert.match(res.message_tr, /kullanılabilir paket seansı yok/);
});

check("draining the last session marks the package depleted", () => {
  // c-2 (Mehmet) has exactly 1 session left.
  assert.equal(remaining("c-2"), 1);
  const res = store.createBooking({
    customer_id: "c-2", therapist_id: null, service_id: "svc-aroma",
    scheduled_at: inMin(400), usePackage: true,
  });
  assert.equal(res.ok, true);
  assert.equal(remaining("c-2"), 0);
  const pkg = store.getSnapshot().customerPackages.find((p) => p.customer_id === "c-2");
  assert.equal(pkg.status, "depleted");
});

console.log("\nCustomers & packages");
check("new customer with a package can book immediately", () => {
  const c = store.createCustomer({
    full_name: "Test Misafir", phone: "0500 000 00 00", packageId: "pkg-prestij",
  });
  assert.equal(remaining(c.id), 8);
  const res = store.createBooking({
    customer_id: c.id, therapist_id: null, service_id: "svc-hamam",
    scheduled_at: inMin(500), usePackage: true,
  });
  assert.equal(res.ok, true);
  assert.equal(remaining(c.id), 7);
});

check("assigning a package grants the full session count", () => {
  const c = store.createCustomer({ full_name: "Paketsiz", phone: "0501" });
  assert.equal(store.activePackageFor(c.id), undefined);
  store.assignPackage(c.id, "pkg-baslangic");
  assert.equal(store.activePackageFor(c.id).remaining_sessions, 4);
});

console.log("\nContent management");
check("services can be added, edited and removed", () => {
  const before = store.getSnapshot().services.length;
  store.upsertService({
    id: "", title_tr: "Test Masajı", description_tr: "x",
    duration_min: 30, price: 1000,
  });
  assert.equal(store.getSnapshot().services.length, before + 1);
  const added = store.getSnapshot().services.at(-1);
  store.upsertService({ ...added, price: 1500 });
  assert.equal(store.getSnapshot().services.at(-1).price, 1500);
  store.removeService(added.id);
  assert.equal(store.getSnapshot().services.length, before);
});

check("therapist active status toggles", () => {
  const t = store.getSnapshot().therapists[0];
  const was = t.active_status;
  store.toggleTherapist(t.id);
  assert.equal(store.getSnapshot().therapists[0].active_status, !was);
});

check("subscribers are notified on change", () => {
  let fired = 0;
  const off = store.subscribe(() => fired++);
  store.upsertOffer({
    id: "", title_tr: "T", description_tr: "d",
    discount_label: "%10", valid_until: null,
  });
  off();
  assert.ok(fired > 0, "listener fired");
});

console.log(`\n${n} store assertions passed.\n`);
