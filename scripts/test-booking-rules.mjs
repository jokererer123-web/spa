/**
 * Verifies the booking business rules against the spec:
 *  - 1 session auto-deducted on confirm
 *  - cancel >= 30 min before the appointment restores the credit
 *  - cancel < 30 min before is non-refundable
 *  - balances of 2 or fewer raise the critical flag
 *
 * Run with: npm run test:rules
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Transpile the TS source to plain ESM so we can import it directly.
const dir = mkdtempSync(path.join(tmpdir(), "reina-rules-"));
const outFile = path.join(dir, "booking-rules.mjs");
const source = execFileSync(
  "npx",
  [
    "--yes",
    "esbuild",
    "src/lib/booking-rules.ts",
    "--format=esm",
    "--target=es2022",
  ],
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
);
writeFileSync(outFile, source);

const rules = await import(pathToFileURL(outFile).href);
rmSync(dir, { recursive: true, force: true });

const {
  applyDeduction,
  applyRestore,
  balanceLevel,
  canDeductSession,
  CRITICAL_SESSION_THRESHOLD,
  FREE_CANCELLATION_MINUTES,
  isCriticalBalance,
  isRefundable,
  minutesUntil,
  resolveCancellation,
} = rules;

const now = new Date("2026-08-17T12:00:00.000Z");
const inMinutes = (m) => new Date(now.getTime() + m * 60_000).toISOString();

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log("\nCancellation window");
check("exactly 30 minutes ahead is refundable (boundary)", () => {
  assert.equal(isRefundable(inMinutes(FREE_CANCELLATION_MINUTES), now), true);
});
check("31 minutes ahead is refundable", () => {
  assert.equal(isRefundable(inMinutes(31), now), true);
});
check("29 minutes ahead is NOT refundable", () => {
  assert.equal(isRefundable(inMinutes(29), now), false);
});
check("already started is NOT refundable", () => {
  assert.equal(isRefundable(inMinutes(-5), now), false);
});
check("minutesUntil is negative in the past", () => {
  assert.equal(minutesUntil(inMinutes(-10), now), -10);
});

console.log("\nCancellation outcome");
check("early cancel restores exactly 1 session", () => {
  const out = resolveCancellation(inMinutes(90), true, now);
  assert.equal(out.refundable, true);
  assert.equal(out.restoreSessions, 1);
  assert.match(out.message_tr, /iade edildi/);
});
check("late cancel restores nothing", () => {
  const out = resolveCancellation(inMinutes(10), true, now);
  assert.equal(out.refundable, false);
  assert.equal(out.restoreSessions, 0);
  assert.match(out.message_tr, /iade edilmedi/);
});
check("cash booking never generates a phantom credit", () => {
  const out = resolveCancellation(inMinutes(120), false, now);
  assert.equal(out.restoreSessions, 0);
  assert.match(out.message_tr, /kullanılmamıştı/);
});

console.log("\nPackage deduction");
check("confirming deducts one session", () => {
  const pkg = { remaining_sessions: 5, status: "active" };
  assert.deepEqual(applyDeduction(pkg), {
    remaining_sessions: 4,
    status: "active",
  });
});
check("last session marks the package depleted", () => {
  assert.deepEqual(applyDeduction({ remaining_sessions: 1, status: "active" }), {
    remaining_sessions: 0,
    status: "depleted",
  });
});
check("deduction never goes negative", () => {
  assert.equal(
    applyDeduction({ remaining_sessions: 0, status: "depleted" }).remaining_sessions,
    0,
  );
});
check("a depleted package cannot be deducted from", () => {
  assert.equal(canDeductSession({ remaining_sessions: 0, status: "active" }), false);
  assert.equal(canDeductSession({ remaining_sessions: 3, status: "expired" }), false);
  assert.equal(canDeductSession({ remaining_sessions: 3, status: "active" }), true);
});
check("restoring a depleted package reactivates it", () => {
  assert.deepEqual(applyRestore({ remaining_sessions: 0, status: "depleted" }), {
    remaining_sessions: 1,
    status: "active",
  });
});
check("deduct then restore is a round trip", () => {
  const start = { remaining_sessions: 3, status: "active" };
  assert.deepEqual(applyRestore(applyDeduction(start)), start);
});

console.log("\nCritical balance flag");
check(`${CRITICAL_SESSION_THRESHOLD} sessions is critical`, () => {
  assert.equal(isCriticalBalance(CRITICAL_SESSION_THRESHOLD), true);
});
check("1 and 0 sessions are critical", () => {
  assert.equal(isCriticalBalance(1), true);
  assert.equal(isCriticalBalance(0), true);
});
check("3 sessions is not critical", () => {
  assert.equal(isCriticalBalance(3), false);
});
check("balance levels are ordered correctly", () => {
  assert.equal(balanceLevel(0), "depleted");
  assert.equal(balanceLevel(2), "critical");
  assert.equal(balanceLevel(4), "low");
  assert.equal(balanceLevel(8), "healthy");
});

console.log(`\n${passed} assertions passed.\n`);
