import type { AvailabilityStart, AvailabilityEnd } from "./types";

/** All trips anchor to the next upcoming weekend relative to "now" —
 * there's no real date picker in this prototype. The sentence's
 * availability blanks pick the start/end moment within that weekend. */

const START_OFFSETS: Record<AvailabilityStart, { dayOffset: number; hour: number }> = {
  "Friday afternoon": { dayOffset: 0, hour: 15 },
  "Friday evening": { dayOffset: 0, hour: 18 },
  "Saturday morning": { dayOffset: 1, hour: 9 },
  "Saturday afternoon": { dayOffset: 1, hour: 13 },
};

const END_OFFSETS: Record<AvailabilityEnd, { dayOffset: number; hour: number }> = {
  "Saturday evening": { dayOffset: 1, hour: 21 },
  "Sunday afternoon": { dayOffset: 2, hour: 16 },
  "Sunday evening": { dayOffset: 2, hour: 20 },
  "Monday morning": { dayOffset: 3, hour: 11 },
};

function nextFriday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const daysUntilFriday = ((5 - day) % 7 + 7) % 7 || 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  friday.setHours(0, 0, 0, 0);
  return friday;
}

export interface AvailabilityWindow {
  startISO: string;
  endISO: string;
  /** Stay dates for accommodation search. */
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  nights: number;
  label: string; // e.g. "Jul 24 – Jul 26"
}

export function availabilityWindow(
  start: AvailabilityStart,
  end: AvailabilityEnd,
): AvailabilityWindow {
  const friday = nextFriday();
  const s = START_OFFSETS[start];
  const e = END_OFFSETS[end];

  const startDate = new Date(friday);
  startDate.setDate(friday.getDate() + s.dayOffset);
  startDate.setHours(s.hour, 0, 0, 0);

  const endDate = new Date(friday);
  endDate.setDate(friday.getDate() + e.dayOffset);
  endDate.setHours(e.hour, 0, 0, 0);

  const nights = Math.max(0, e.dayOffset - s.dayOffset);
  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const label = `${startDate.toLocaleDateString("en-US", opts)} – ${endDate.toLocaleDateString("en-US", opts)}`;

  return {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    checkin: fmtDate(startDate),
    checkout: fmtDate(endDate),
    nights,
    label,
  };
}
