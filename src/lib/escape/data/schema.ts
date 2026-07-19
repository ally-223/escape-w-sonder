import type { ArchetypeId } from "../types";

/**
 * Destination catalog schema — the content layer for Sonder Escape.
 *
 * This is a standalone superset of the legacy 3-destination data. The
 * legacy `DestinationId` type in ../types is deliberately untouched;
 * the three legacy IDs ("toronto", "niagara-falls", "montreal") reuse
 * the exact same string literals here, so wiring the reveal UI to this
 * catalog later requires no URL-schema change.
 *
 * Every number in this file is a PROTOTYPE ESTIMATE, not live data.
 */

export type CatalogDestinationId =
  | "toronto"
  | "niagara-falls"
  | "niagara-on-the-lake"
  | "hamilton"
  | "blue-mountain"
  | "prince-edward-county"
  | "kingston"
  | "ottawa"
  | "montreal"
  | "quebec-city";

export type TravelTimeBand = "local" | "under-2h" | "2h-4h" | "4h-6h" | "6h-plus";

export type TransportMode = "walk-transit" | "go-transit" | "coach-bus" | "via-rail" | "car";

export type HotelTier = "affordable" | "balanced" | "memorable";

export type AccommodationStyle =
  | "simple and affordable"
  | "cozy and social"
  | "private and comfortable"
  | "unique and memorable"
  | "stylish and luxurious";

export type ItineraryStructure =
  | "completely spontaneous"
  | "loosely planned"
  | "a balanced schedule"
  | "carefully planned";

export type CravingTag =
  | "food-cafes"
  | "art-culture"
  | "nature-outdoors"
  | "nightlife"
  | "wellness-relaxation"
  | "games-play"
  | "local-events"
  | "shopping-vintage"
  | "hidden-gems";

export type PlanCategory = "culture-food" | "nature-wellness" | "social-nightlife";

/** Marker used wherever a real Stay22 tracked link would eventually go. */
export const BOOKING_LINK_PLACEHOLDER = "placeholder://stay22-tracked-link-not-yet-generated";

export interface TransportOption {
  mode: TransportMode;
  label: string;
  /** Estimated ROUND-TRIP cost per person from U of T St. George. */
  roundTripCostPerPerson: number;
  /** Typical one-way duration in hours. */
  oneWayHours: number;
}

export interface HotelOption {
  id: string;
  tier: HotelTier;
  name: string;
  style: AccommodationStyle;
  neighborhood: string;
  /** Existing public/ asset path, or "" for the branded gradient tile. */
  image: string;
  guestRating: number; // 0-10, Stay22-style
  hotelStars: number | null; // null where star ratings don't apply (rentals, B&Bs)
  nightlyPrice: number; // whole room/unit per night
  /** Convenience: nightlyPrice x 2 nights (the typical weekend). */
  typicalStayPrice: number;
  /** Convenience: typicalStayPrice / assumedGuests. */
  typicalCostPerPerson: number;
  /** How many people the room/unit sleeps for the per-person math. */
  assumedGuests: number;
  description: string;
  amenities: string[];
  whyItFits: string;
  /** Query to feed Stay22's `address` param when replacing this mock. */
  stay22Query: string;
  bookingUrl: typeof BOOKING_LINK_PLACEHOLDER;
  isMockData: true;
}

export interface PlanActivity {
  slot: string; // e.g. "arrival", "dinner", "morning activity"
  title: string;
  detail: string;
}

export interface PlanDay {
  day: 1 | 2 | 3;
  label: string;
  activities: PlanActivity[];
}

export interface TripPlan {
  id: string;
  category: PlanCategory;
  title: string;
  vibe: string;
  cravingTags: CravingTag[];
  archetypes: ArchetypeId[];
  itineraryStructures: ItineraryStructure[];
  activityCostPerPerson: number;
  mealCostPerPerson: number;
  /** activityCostPerPerson + mealCostPerPerson (transport lives on the destination). */
  totalNonHotelCostPerPerson: number;
  days: PlanDay[];
  backupActivity: string;
  whyItFits: string;
}

export interface DestinationRecord {
  id: CatalogDestinationId;
  name: string;
  region: string;
  country: "Canada";
  /** Feed straight into Stay22's `address` param. */
  stay22Query: string;
  distanceKm: number;
  oneWayTravelHours: number;
  travelTimeBand: TravelTimeBand;
  transportOptions: TransportOption[];
  /** Recommended option's round-trip cost — used in every budget calc. */
  estTransportCostPerPerson: number;
  /** Realistic total weekend cost per person (hotel share + transport + food + activities). */
  weekendBudgetMinPerPerson: number;
  weekendBudgetMaxPerPerson: number;
  requiresBorderCrossing: boolean;
  /** Recommended minimum nights for the trip to feel worth the travel. */
  minTripNights: number;
  vibeTags: string[];
  cravingTags: CravingTag[];
  accommodationStyles: AccommodationStyle[];
  itineraryStructures: ItineraryStructure[];
  archetypes: ArchetypeId[];
  description: string;
  whyItFits: string;
  heroImage: string;
  /** Rough monthly 1BR rent — powers the rent-vs-escape stat. */
  approxMonthlyRent: number;
  hotels: [HotelOption, HotelOption, HotelOption]; // exactly affordable, balanced, memorable
  plans: [TripPlan, TripPlan, TripPlan]; // exactly culture-food, nature-wellness, social-nightlife
}
