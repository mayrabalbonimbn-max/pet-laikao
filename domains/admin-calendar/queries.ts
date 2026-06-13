import {
  listAdminCalendarEvents,
  listUnifiedCalendarItems
} from "@/server/repositories/admin-calendar-repository";

function startOfWeek(date: Date) {
  const clone = new Date(date);
  const day = clone.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  clone.setUTCDate(clone.getUTCDate() + diff);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
}

export function getCalendarRange(view: "month" | "week" | "day", date: string) {
  const base = new Date(`${date}T12:00:00.000Z`);

  if (view === "day") {
    const from = new Date(`${date}T00:00:00.000Z`);
    const to = new Date(`${date}T23:59:59.999Z`);
    return { from, to };
  }

  if (view === "week") {
    const from = startOfWeek(base);
    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + 6);
    to.setUTCHours(23, 59, 59, 999);
    return { from, to };
  }

  const monthStart = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  const from = startOfWeek(monthStart);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 34);
  to.setUTCHours(23, 59, 59, 999);
  return { from, to };
}

export async function getUnifiedAdminCalendar(view: "month" | "week" | "day", date: string) {
  const range = getCalendarRange(view, date);
  const [items, events] = await Promise.all([
    listUnifiedCalendarItems(range),
    listAdminCalendarEvents(range)
  ]);

  return {
    range,
    items,
    events
  };
}
