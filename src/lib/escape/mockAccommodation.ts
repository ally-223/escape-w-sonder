import type { Accommodation, DestinationId } from "./types";

/**
 * Realistic fallback accommodation data, used when the live Stay22 call
 * (see src/app/api/escape/accommodation/route.ts) fails or no API key is
 * configured. Same shape as a mapped Stay22 response, so nothing
 * downstream needs to know which source it came from.
 *
 * `image` is intentionally left empty — none of Sonder's existing assets
 * are real property photography, and repurposing an unrelated candid
 * photo as a "hotel photo" reads as broken rather than charming.
 * AccommodationCard renders a branded gradient placeholder instead.
 */
const FALLBACK_DATA: Record<DestinationId, Omit<Accommodation, "source">[]> = {
  montreal: [
    { id: "fallback-mtl-1", name: "Hôtel Plateau Loft", location: "Le Plateau-Mont-Royal, Montréal", image: "", ratingValue: 8.9, ratingCount: 412, pricePerNightTotal: 246, bookingUrl: "https://www.stay22.com", provider: "Booking.com" },
    { id: "fallback-mtl-2", name: "Vieux-Port Boutique Stay", location: "Old Montréal", image: "", ratingValue: 9.1, ratingCount: 268, pricePerNightTotal: 289, bookingUrl: "https://www.stay22.com", provider: "Expedia" },
    { id: "fallback-mtl-3", name: "Mile End Group Suite", location: "Mile End, Montréal", image: "", ratingValue: 8.6, ratingCount: 190, pricePerNightTotal: 198, bookingUrl: "https://www.stay22.com", provider: "Vrbo" },
  ],
  toronto: [
    { id: "fallback-tor-1", name: "King West Skyline Suites", location: "King West, Toronto", image: "", ratingValue: 8.7, ratingCount: 531, pricePerNightTotal: 312, bookingUrl: "https://www.stay22.com", provider: "Booking.com" },
    { id: "fallback-tor-2", name: "Distillery District Loft", location: "Distillery District, Toronto", image: "", ratingValue: 9.0, ratingCount: 344, pricePerNightTotal: 279, bookingUrl: "https://www.stay22.com", provider: "Hotels.com" },
    { id: "fallback-tor-3", name: "Kensington Market Flat", location: "Kensington Market, Toronto", image: "", ratingValue: 8.4, ratingCount: 156, pricePerNightTotal: 224, bookingUrl: "https://www.stay22.com", provider: "Vrbo" },
  ],
  "niagara-falls": [
    { id: "fallback-nia-1", name: "Fallsview Terrace Hotel", location: "Fallsview, Niagara Falls", image: "", ratingValue: 8.5, ratingCount: 620, pricePerNightTotal: 189, bookingUrl: "https://www.stay22.com", provider: "Booking.com" },
    { id: "fallback-nia-2", name: "Clifton Hill Retreat", location: "Clifton Hill, Niagara Falls", image: "", ratingValue: 8.2, ratingCount: 298, pricePerNightTotal: 152, bookingUrl: "https://www.stay22.com", provider: "Expedia" },
    { id: "fallback-nia-3", name: "Niagara-on-the-Lake Cottage", location: "Niagara-on-the-Lake", image: "", ratingValue: 9.2, ratingCount: 87, pricePerNightTotal: 231, bookingUrl: "https://www.stay22.com", provider: "Vrbo" },
  ],
};

export function fallbackAccommodations(destinationId: DestinationId): Accommodation[] {
  return FALLBACK_DATA[destinationId].map((item) => ({ ...item, source: "fallback" }));
}
