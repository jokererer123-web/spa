"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration-safe access to the current time.
 *
 * Every screen in this app is statically prerendered, so reading the clock
 * during render would bake build-time values into the HTML and mismatch on
 * hydration. `useSyncExternalStore` gives the server (and the first client
 * render) a stable snapshot, then switches to the live value after hydration —
 * without any setState-inside-effect.
 */

const TICK_MS = 30_000;

let current = 0; // epoch ms; 0 means "not started yet"
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function start() {
  if (timer) return;
  current = Date.now();
  timer = setInterval(() => {
    current = Date.now();
    for (const listener of listeners) listener();
  }, TICK_MS);
}

function subscribe(listener: () => void) {
  const first = listeners.size === 0;
  listeners.add(listener);
  if (first) start();
  // The very first subscriber seeds the clock, so notify immediately to swap
  // the server snapshot for the real time.
  listener();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => 0;

/**
 * Returns the current time as a Date, or `null` before hydration.
 * Callers should render time-dependent output only once this is non-null.
 */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ms === 0 ? null : new Date(ms);
}

/** True once the component has hydrated on the client. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
