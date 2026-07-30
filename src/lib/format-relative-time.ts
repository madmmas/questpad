const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < MINUTE_MS) return "just now";

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(diffMs / DAY_MS);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
