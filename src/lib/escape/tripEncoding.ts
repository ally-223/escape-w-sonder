import type { TripResult } from "./types";

export function encodeTrip(trip: TripResult): string {
  const json = JSON.stringify(trip);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTrip(encoded: string): TripResult | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json) as Partial<TripResult>;
    if (
      !parsed ||
      !parsed.destinationId ||
      !parsed.planId ||
      !parsed.hotelId ||
      !parsed.preferences ||
      !parsed.answers ||
      typeof parsed.answers.socialInitiation !== "number" ||
      typeof parsed.answers.decisionMaking !== "number" ||
      typeof parsed.answers.openness !== "number" ||
      !parsed.answers.groupRole ||
      !parsed.answers.socialRhythm ||
      !Array.isArray(parsed.answers.conversationStyles)
    ) {
      return null;
    }
    return parsed as TripResult;
  } catch {
    return null;
  }
}
