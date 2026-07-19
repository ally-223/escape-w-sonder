/**
 * Sonder Escape — shared types.
 * This whole `escape` tree is additive and isolated from the rest of Sonder;
 * nothing here is imported by, or imports from, the main app's schemas.
 */

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

export type BudgetRange = "$150-300" | "$300-400" | "$400-600" | "$600+";
export type TripVibe =
  | "cafés & art"
  | "nightlife & energy"
  | "nature & quiet"
  | "food & culture";
export type TripFeel = "relaxing" | "thrilling" | "spontaneous" | "nostalgic";
export type TripPersonality =
  | "adventurous"
  | "laid-back"
  | "curious"
  | "sociable";

/** The fill-in-the-blank sentence screen. `companionship` doubles as the
 * friends-vs-compatible-people mode selector. */
export interface TripPreferences {
  pace: "spontaneous" | "planned";
  companionship: "new_people" | "friends";
  personality: TripPersonality;
  budget: BudgetRange;
  vibe: TripVibe;
  feel: TripFeel;
  /** Trip length in nights, always a weekend escape for this prototype. */
  nights: 2;
  groupSize: number;
}

export type DestinationId = "montreal" | "toronto" | "niagara-falls";

export interface Destination {
  id: DestinationId;
  name: string;
  province: string;
  description: string;
  heroImage: string;
  /** Rough monthly 1BR rent used only for the rent-vs-escape stat. */
  approxMonthlyRent: number;
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

export interface ItineraryActivity {
  slot: "signature" | "food" | "social";
  day: 1 | 2;
  title: string;
  description: string;
}

export interface CostBreakdown {
  accommodationPerPerson: number;
  transportPerPerson: number;
  foodAndActivitiesPerPerson: number;
  totalPerPerson: number;
  groupSize: number;
  accommodationTotal: number;
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

/**
 * The full generated trip, encoded straight into the URL (base64url JSON)
 * so a "shareable link" genuinely works for anyone who opens it — no
 * backend, no auth, no database row required. Archetype and destination
 * are intentionally NOT stored here; they're derived deterministically
 * from `answers` + `preferences` on every load (see deriveTrip.ts), so
 * there's a single source of truth and a shorter URL.
 */
/** The user's lightweight escape profile — chosen during the post-survey
 * "pick your blob" step, mirroring Sonder's ProfileCard. */
export interface EscapeProfile {
  name: string;
  /** One of Sonder's blob avatars, e.g. "pfp3". */
  pfp: string;
}

export interface TripResult {
  preferences: TripPreferences;
  answers: SurveyAnswers;
  /** Optional so links generated before this field existed still decode. */
  profile?: EscapeProfile;
  createdAt: number;
}

export interface DerivedTrip extends TripResult {
  archetypeId: ArchetypeId;
  destinationId: DestinationId;
}
