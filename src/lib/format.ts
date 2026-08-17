const TZ = "Europe/Istanbul";

export const tryFormat = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return tryFormat.format(value);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDayShort(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { weekday: "long", timeZone: TZ }).format(
    new Date(iso),
  );
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** "35 dk sonra" / "12 dk önce" — relative label for the desk board. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMin = Math.round((new Date(iso).getTime() - now.getTime()) / 60000);
  const abs = Math.abs(diffMin);
  if (abs < 1) return "şimdi";
  if (abs < 60) return diffMin > 0 ? `${abs} dk sonra` : `${abs} dk önce`;
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  const label = mins ? `${hours} sa ${mins} dk` : `${hours} saat`;
  return diffMin > 0 ? `${label} sonra` : `${label} önce`;
}

export function isSameDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

/** Value for a datetime-local input, in local time. */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
