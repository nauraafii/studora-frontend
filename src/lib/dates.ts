import type { Task } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const APP_TIME_ZONE = "Asia/Jakarta";

function getJakartaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getTodayISO() {
  const parts = getJakartaDateParts(new Date());
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addDaysToISO(date: string, offset: number) {
  const base = new Date(`${date}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + offset);
  return [base.getUTCFullYear(), String(base.getUTCMonth() + 1).padStart(2, "0"), String(base.getUTCDate()).padStart(2, "0")].join("-");
}

export function dateAfterDays(offset: number) {
  return addDaysToISO(getTodayISO(), offset);
}

export function resolveTaskDueDate(task: Task) {
  return task.dueDate ?? (task.dueInDays === undefined ? null : dateAfterDays(task.dueInDays));
}

export function getDaysUntil(date: string) {
  const today = new Date(`${getTodayISO()}T00:00:00.000Z`).getTime();
  const due = new Date(`${date}T00:00:00.000Z`).getTime();
  return Math.round((due - today) / DAY_MS);
}

export function formatDate(date: string | null, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return "Belum ditentukan";
  const timestamp = new Date(`${date}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", ...options }).format(timestamp);
}

export function formatDueDate(date: string | null) {
  if (!date) return "Belum ditentukan";
  const days = getDaysUntil(date);
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  return formatDate(date, { weekday: "short", day: "numeric", month: "short" });
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining} mnt`;
  return remaining ? `${hours} j ${remaining} mnt` : `${hours} j`;
}

export function formatTimeRange(startTime: string, durationMinutes: number) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const end = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(end / 60) % 24;
  const endMinutes = end % 60;
  return `${startTime}–${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}
