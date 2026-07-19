/**
 * Sonder Escape — shared types.
 * This whole `escape` tree is additive and isolated from the rest of Sonder;
 * nothing here is imported by, or imports from, the main app's schemas.
 */
import type {
  AccommodationStyle,
  CatalogDestinationId,
  CravingTag,
  ItineraryStructure,
} from "./data/schema";

/** Each of the 10 personality dimensions is a 0-100 slider/binary value. */
export type DimensionKey =
  | "introversion" // 0 introverted <-> 100 extroverted
  | "planning" // 0 detailed planner <-> 100 spontaneous
  | "pace" // 0 relaxed <-> 100 packed itinerary
  | "novelty" // 0 familiar favourites <-> 100 new experiences
  | "groupSize" // 0 small intimate group <-> 100 larger social group
  | "nightlife" // 0 quiet evenings <-> 100 nightlife
  | "setting" // 0 nature <-> 100 city
  | "spend" // 0 budget-conscious <-> 100 willing to splurge
  | "togetherness" // 0 independent time <-> 100 doing everything together
  | "adventure"; // 0 comfort-focused <-> 100 adventure-focused

export type SurveyAnswers = Record<DimensionKey, number>;

export type ArchetypeId =
  | "curious-connector"
  | "cozy-wanderer"
  | "social-explorer"
  | "intentional-adventurer"
  | "chaos-tourist"
  | "culture-collector";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  traits: [string, string, string];
  /** Mascot image reused from Sonder's existing blob art. */
  image: string;
  /** Ideal 0-100 profile per dimension, used for nearest-centroid scoring. */
  centroid: SurveyAnswers;
}

/** Fill-in-the-blank options — display strings shown inside the sentence. */
export type AvailabilityStart =
  | "Friday afternoon"
  | "Friday evening"
  | "Saturday morning"
  | "Saturday afternoon";
export type AvailabilityEnd =
  | "Saturday evening"
  | "Sunday afternoon"
  | "Sunday evening"
  | "Monday morning";
export type Companionship = "my friends" | "compatible new people" | "a mix of both" | "surprise me";
export type BudgetRange = "Under $200" | "$200–300" | "$300–400" | "$400–600" | "$600+";
export type TravelDistance = "1 hour away" | "3 hours away" | "5 hours away" | "anywhere reachable";

/** The fill-in-the-blank sentence, one field per blank. `companionship`
 * doubles as the friends-vs-compatible-people mode selector. */
export interface TripPreferences {
  availabilityStart: AvailabilityStart;
  availabilityEnd: AvailabilityEnd;
  companionship: Companionship;
  budget: BudgetRange;
  maxTravel: TravelDistance;
  accommodationStyle: AccommodationStyle;
  /** Up to 3; empty array means "surprise me". */
  cravings: CravingTag[];
  structure: ItineraryStructure;
  groupSize: number;
}

export interface Accommodation {
  id: string;
  name: string;
  location: string;
  image: string;
  ratingValue: number; // 0-10 Stay22-style guest rating
  ratingCount: number;
  pricePerNightTotal: number; // total nightly rate for the room (not per person)
  bookingUrl: string;
  provider: string;
  source: "stay22" | "fallback";
}

export interface RentVsEscapeStat {
  monthlyEquivalent: number;
  cityRent: number;
  message: string;
}

export interface CompatibleProfile {
  id: string;
  firstName: string;
  avatar: string;
  bio: string;
  compatibility: number; // 0-100
  reasons: [string, string];
}

/** The user's lightweight escape profile — chosen during the post-survey
 * "pick your blob" step, mirroring Sonder's ProfileCard. */
export interface EscapeProfile {
  name: string;
  /** One of Sonder's blob avatars, e.g. "pfp3". */
  pfp: string;
}

/**
 * The full generated trip, encoded straight into the URL (base64url JSON)
 * so a "shareable link" genuinely works for anyone who opens it — no
 * backend, no auth, no database row required. The archetype stays derived
 * from `answers`; the destination/plan/hotel are STORED because the user
 * now picks one of three revealed options — a choice can't be re-derived.
 */
export interface TripResult {
  preferences: TripPreferences;
  answers: SurveyAnswers;
  destinationId: CatalogDestinationId;
  planId: string;
  hotelId: string;
  /** Optional so links generated before this field existed still decode. */
  profile?: EscapeProfile;
  createdAt: number;
}

export interface DerivedTrip extends TripResult {
  archetypeId: ArchetypeId;
}
