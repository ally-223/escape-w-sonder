import type { TripResult } from "./types";

/**
 * Encodes/decodes a TripResult into a URL-safe base64 string so trip and
 * invite links are fully self-contained — open the link on any device and
 * it renders, with no server-side storage involved (intentional for a
 * hackathon prototype: no database, no auth required to view a trip).
 */
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
    return JSON.parse(json) as TripResult;
  } catch {
    return null;
  }
}
