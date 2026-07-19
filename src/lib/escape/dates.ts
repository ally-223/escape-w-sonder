/** Every escape defaults to the next upcoming Friday-Sunday weekend —
 * there's no manual date picker in this prototype (keeps the survey
 * fast per spec); this is the one deterministic assumption baked in. */
export function nextWeekend(): { checkin: string; checkout: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const daysUntilFriday = ((5 - day) % 7 + 7) % 7 || 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { checkin: fmt(friday), checkout: fmt(sunday) };
}

export function formatDateRange(checkin: string, checkout: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const inDate = new Date(`${checkin}T00:00:00`);
  const outDate = new Date(`${checkout}T00:00:00`);
  return `${inDate.toLocaleDateString("en-US", opts)} – ${outDate.toLocaleDateString("en-US", opts)}`;
}
