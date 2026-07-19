import type {
  AccommodationStyle,
  CatalogDestinationId,
  CravingTag,
  ItineraryStructure,
} from "./data/schema";

export type GroupRole = "organizer" | "connector" | "energy" | "observer" | "flexible";
export type ConversationStyle =
  | "playful"
  | "deep"
  | "ideas"
  | "stories"
  | "interests"
  | "quiet"
  | "debates"
  | "variety";
export type SocialRhythm = "together" | "balanced" | "smallGroups" | "independent";

export interface SurveyAnswers {
  socialInitiation: number;
  groupRole: GroupRole;
  conversationStyles: ConversationStyle[];
  decisionMaking: number;
  socialRhythm: SocialRhythm;
  openness: number;
}

export type PersonalityTypeId =
  | "socialCatalyst"
  | "warmConnector"
  | "spontaneousExplorer"
  | "thoughtfulObserver"
  | "steadyPlanner"
  | "easygoingCompanion"
  | "deepConversationalist"
  | "independentWanderer";

export type PersonalityType = {
  id: PersonalityTypeId;
  name: string;
  shortDescription: string;
  strengths: string[];
};

/** Legacy recommendation buckets used only by the existing destination catalog. */
export type ArchetypeId =
  | "curious-connector"
  | "cozy-wanderer"
  | "social-explorer"
  | "intentional-adventurer"
  | "chaos-tourist"
  | "culture-collector";

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
export type BudgetRange = "Under $200" | "$200–300" | "$300–400" | "$400–600" | "$600+" | "Flexible";
export type TravelDistance = "1 hour away" | "3 hours away" | "5 hours away" | "anywhere reachable";

export type TripStyle = "carefully planned" | "lightly planned" | "spontaneous" | "surprise me";
export type TravelParty = "my friends" | "new people" | "a mix of both" | "I’m open to either";
export type GroupPersonality = "adventurous" | "easygoing" | "social" | "thoughtful" | "curious" | "playful";
export type TripVibe =
  | "cafés & art"
  | "food & nightlife"
  | "nature & wellness"
  | "active & outdoors"
  | "local hidden gems"
  | "classic sightseeing"
  | "a little of everything"
  | "surprise me";
export type TripPace = "very relaxing" | "relaxing" | "balanced" | "lively" | "packed";

/** Six visible blanks plus deterministic internal fields consumed by the existing recommender. */
export interface TripPreferences {
  tripStyle: TripStyle;
  travelParty: TravelParty;
  groupPersonality: GroupPersonality;
  budget: BudgetRange;
  tripVibe: TripVibe;
  pace: TripPace;
  availabilityStart: AvailabilityStart;
  availabilityEnd: AvailabilityEnd;
  companionship: Companionship;
  maxTravel: TravelDistance;
  accommodationStyle: AccommodationStyle;
  cravings: CravingTag[];
  structure: ItineraryStructure;
  groupSize: number;
}

export interface Accommodation {
  id: string;
  name: string;
  location: string;
  image: string;
  ratingValue: number;
  ratingCount: number;
  pricePerNightTotal: number;
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
  personalityId: PersonalityTypeId;
  personalityName: string;
  strengths: string[];
  compatibility: number;
  reasons: [string, string];
  groupPersonalityTags: GroupPersonality[];
}

export interface EscapeProfile {
  name: string;
  pfp: string;
}

export interface TripResult {
  preferences: TripPreferences;
  answers: SurveyAnswers;
  destinationId: CatalogDestinationId;
  planId: string;
  hotelId: string;
  profile?: EscapeProfile;
  selectedProfileIds?: string[];
  createdAt: number;
}

export interface DerivedTrip extends TripResult {
  archetypeId: ArchetypeId;
  personalityType: PersonalityType;
}
