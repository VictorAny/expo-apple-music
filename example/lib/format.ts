export function formatDuration(duration: number | string): string {
  const ms = typeof duration === "string" ? Number(duration) : duration;
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const totalSec = ms > 1000 ? Math.floor(ms / 1000) : Math.floor(ms);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
