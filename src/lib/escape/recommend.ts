import { CATALOG } from "./data/catalog";
import type {
  AccommodationStyle,
  CatalogDestinationId,
  CravingTag,
  DestinationRecord,
  HotelOption,
  HotelTier,
  ItineraryStructure,
  TransportMode,
  TripPlan,
} from "./data/schema";
import type { ArchetypeId, BudgetRange, TravelDistance, TripPreferences } from "./types";
import { availabilityWindow } from "./dates";

/**
 * Deterministic destination recommendation over the 10-destination
 * catalog. No per-destination conditionals live here — everything is
 * metadata overlap against centralized weights, so tuning behaviour
 * means editing WEIGHTS or the catalog, never this logic.
 */

export interface RecommendInput {
  /** ISO datetimes bounding the user's availability. */
  startDateTime: string;
  endDateTime: string;
  /** Nights available. Derived from the dates when omitted. */
  tripNights?: number;
  budgetPerPerson: number;
  /** Max one-way travel hours the user will tolerate. Infinity = anywhere. */
  maxTravelHours: number;
  cravings: CravingTag[];
  accommodationStyle: AccommodationStyle;
  itineraryStructure: ItineraryStructure;
  archetypeId: ArchetypeId;
  transportMode?: TransportMode;
  allowBorderCrossing?: boolean; // default true
  groupSize?: number; // default 4
}

export interface CostBreakdownPerPerson {
  accommodation: number;
  transport: number;
  food: number;
  activities: number;
  total: number;
}

export interface ScoreBreakdown {
  craving: number;
  accommodation: number;
  structure: number;
  archetype: number;
  budgetFit: number;
  travelEase: number;
  tieBreak: number;
  total: number;
}

export interface Exclusion {
  destinationId: CatalogDestinationId;
  reason: string;
}

export interface Recommendation {
  destination: DestinationRecord;
  hotel: HotelOption;
  plan: TripPlan;
  cost: CostBreakdownPerPerson;
  score: ScoreBreakdown;
  reasons: string[];
  /** Set when this result only passed after a filter was relaxed. */
  relaxedConstraint?: "travel-time" | "budget";
}

export interface RecommendResult {
  recommendations: Recommendation[]; // up to 3, best first
  exclusions: Exclusion[];
  input: Required<Pick<RecommendInput, "tripNights" | "groupSize" | "allowBorderCrossing">> &
    RecommendInput;
}

export const BUDGET_MIDPOINTS: Record<BudgetRange, number> = {
  "Under $200": 175,
  "$200–300": 250,
  "$300–400": 350,
  "$400–600": 500,
  "$600+": 700,
};

const TRAVEL_HOURS: Record<TravelDistance, number> = {
  "1 hour away": 1,
  "3 hours away": 3,
  "5 hours away": 5,
  "anywhere reachable": Infinity,
};

/** Bridge from the fill-in-the-blank sentence to the engine's input. */
export function preferencesToInput(
  preferences: TripPreferences,
  archetypeId: ArchetypeId,
): RecommendInput {
  const window = availabilityWindow(preferences.availabilityStart, preferences.availabilityEnd);
  return {
    startDateTime: window.startISO,
    endDateTime: window.endISO,
    tripNights: window.nights,
    budgetPerPerson: BUDGET_MIDPOINTS[preferences.budget],
    maxTravelHours: TRAVEL_HOURS[preferences.maxTravel],
    cravings: preferences.cravings,
    accommodationStyle: preferences.accommodationStyle,
    itineraryStructure: preferences.structure,
    archetypeId,
    groupSize: preferences.groupSize,
  };
}

/** All scoring weights in one place. Sum of maxima = 100. */
export const WEIGHTS = {
  craving: 40,
  accommodation: 10,
  structure: 10,
  archetype: 15,
  budgetFit: 15,
  travelEase: 10,
} as const;

export const CRAVING_LABELS: Record<CravingTag, string> = {
  "food-cafes": "food & cafés",
  "art-culture": "art & culture",
  "nature-outdoors": "nature & outdoors",
  nightlife: "nightlife",
  "wellness-relaxation": "wellness & relaxation",
  "games-play": "games & playful activities",
  "local-events": "local events",
  "shopping-vintage": "shopping & vintage",
  "hidden-gems": "hidden gems",
};

const STYLE_TIER_PREFERENCE: Record<AccommodationStyle, HotelTier[]> = {
  "simple and affordable": ["affordable", "balanced", "memorable"],
  "cozy and social": ["balanced", "memorable", "affordable"],
  "private and comfortable": ["balanced", "memorable", "affordable"],
  "unique and memorable": ["memorable", "balanced", "affordable"],
  "stylish and luxurious": ["memorable", "balanced", "affordable"],
};

/** Deterministic pseudo-random in [0,1) from a string — used ONLY as a
 * final tie-breaker so equal-scoring results have a stable order. */
function stableTieBreak(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function nightsBetween(startISO: string, endISO: string): number {
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  return Math.max(0, Math.floor(ms / (24 * 3600 * 1000)));
}

function hotelCostPerPerson(hotel: HotelOption, nights: number): number {
  return Math.round((hotel.nightlyPrice * nights) / hotel.assumedGuests);
}

function tripTotal(
  destination: DestinationRecord,
  hotel: HotelOption,
  plan: TripPlan,
  nights: number,
): CostBreakdownPerPerson {
  const accommodation = hotelCostPerPerson(hotel, nights);
  const transport = destination.estTransportCostPerPerson;
  const food = plan.mealCostPerPerson;
  const activities = plan.activityCostPerPerson;
  return { accommodation, transport, food, activities, total: accommodation + food + transport + activities };
}

function overlap<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.includes(x));
}

/** Pick the hotel tier: walk the style-preference order and take the
 * first option whose full-trip total fits the budget (small tolerance);
 * if none fit, take the option with the lowest total. Never blindly
 * cheapest — the style preference is honoured first. */
function selectHotel(
  destination: DestinationRecord,
  plan: TripPlan,
  style: AccommodationStyle,
  budget: number,
  nights: number,
): HotelOption {
  const order = STYLE_TIER_PREFERENCE[style];
  const byTier = (tier: HotelTier) => destination.hotels.find((h) => h.tier === tier)!;

  for (const tier of order) {
    const hotel = byTier(tier);
    if (tripTotal(destination, hotel, plan, nights).total <= budget * 1.05) return hotel;
  }
  return [...destination.hotels].sort(
    (a, b) =>
      tripTotal(destination, a, plan, nights).total - tripTotal(destination, b, plan, nights).total,
  )[0];
}

/** Pick the plan: cravings dominate, itinerary structure second,
 * archetype third, stable tie-break last. */
function selectPlan(
  destination: DestinationRecord,
  cravings: CravingTag[],
  structure: ItineraryStructure,
  archetypeId: ArchetypeId,
): TripPlan {
  const scored = destination.plans.map((plan) => ({
    plan,
    score:
      overlap(cravings, plan.cravingTags).length * 3 +
      (plan.itineraryStructures.includes(structure) ? 2 : 0) +
      (plan.archetypes.includes(archetypeId) ? 1 : 0) +
      stableTieBreak(plan.id) * 0.01,
  }));
  return scored.sort((a, b) => b.score - a.score)[0].plan;
}

function scoreDestination(
  destination: DestinationRecord,
  input: RecommendInput & { tripNights: number },
): ScoreBreakdown {
  const cravingMatches = overlap(input.cravings, destination.cravingTags).length;
  const craving =
    input.cravings.length === 0
      ? WEIGHTS.craving * 0.5 // "surprise me" — neutral score for everyone
      : (cravingMatches / input.cravings.length) * WEIGHTS.craving;

  const accommodation = destination.accommodationStyles.includes(input.accommodationStyle)
    ? WEIGHTS.accommodation
    : 0;

  const structure = destination.itineraryStructures.includes(input.itineraryStructure)
    ? WEIGHTS.structure
    : 0;

  const archetype = destination.archetypes.includes(input.archetypeId) ? WEIGHTS.archetype : 0;

  const { weekendBudgetMinPerPerson: min, weekendBudgetMaxPerPerson: max } = destination;
  const mid = (min + max) / 2;
  const budgetCloseness = 1 - Math.min(1, Math.abs(input.budgetPerPerson - mid) / (max - min));
  const budgetFit = budgetCloseness * WEIGHTS.budgetFit;

  const travelEase =
    input.maxTravelHours === Infinity
      ? WEIGHTS.travelEase * 0.5
      : Math.max(0, 1 - destination.oneWayTravelHours / input.maxTravelHours) * WEIGHTS.travelEase;

  const tieBreak =
    stableTieBreak(`${destination.id}|${input.budgetPerPerson}|${input.cravings.join(",")}`) * 0.1;

  const total = craving + accommodation + structure + archetype + budgetFit + travelEase + tieBreak;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    craving: round(craving),
    accommodation,
    structure,
    archetype,
    budgetFit: round(budgetFit),
    travelEase: round(travelEase),
    tieBreak: round(tieBreak),
    total: round(total),
  };
}

function buildReasons(
  destination: DestinationRecord,
  input: RecommendInput & { tripNights: number },
  cost: CostBreakdownPerPerson,
  relaxed?: Recommendation["relaxedConstraint"],
): string[] {
  const reasons: string[] = [];
  const matches = overlap(input.cravings, destination.cravingTags);
  if (matches.length > 0) {
    reasons.push(
      `Matches ${matches.length} of your ${input.cravings.length} craving${input.cravings.length > 1 ? "s" : ""} (${matches.map((m) => CRAVING_LABELS[m]).join(", ")})`,
    );
  }
  if (cost.total <= input.budgetPerPerson) {
    reasons.push(`Fits your budget: ~$${cost.total}/person all-in vs $${input.budgetPerPerson} available`);
  }
  if (destination.oneWayTravelHours <= 2) {
    reasons.push(`Only ~${destination.oneWayTravelHours}h from U of T — easy for your window`);
  }
  if (destination.archetypes.includes(input.archetypeId)) {
    reasons.push(destination.whyItFits);
  }
  if (relaxed === "travel-time") {
    reasons.push("Slightly beyond your travel range, but the best fit otherwise — worth the extra ride?");
  }
  if (relaxed === "budget") {
    reasons.push("A little over budget at full price — trimming one activity closes the gap");
  }
  return reasons.slice(0, 3);
}

export function recommend(rawInput: RecommendInput): RecommendResult {
  const tripNights =
    rawInput.tripNights ?? nightsBetween(rawInput.startDateTime, rawInput.endDateTime);
  const groupSize = rawInput.groupSize ?? 4;
  const allowBorderCrossing = rawInput.allowBorderCrossing ?? true;
  const input = { ...rawInput, tripNights, groupSize, allowBorderCrossing };

  const totalWindowHours =
    (new Date(input.endDateTime).getTime() - new Date(input.startDateTime).getTime()) / 3600000;

  const exclusions: Exclusion[] = [];
  const survivors: DestinationRecord[] = [];
  const nearMisses: { destination: DestinationRecord; relaxed: "travel-time" | "budget" }[] = [];

  for (const destination of CATALOG) {
    if (destination.requiresBorderCrossing && !allowBorderCrossing) {
      exclusions.push({ destinationId: destination.id, reason: "requires a border crossing you've ruled out" });
      continue;
    }
    if (input.transportMode && !destination.transportOptions.some((t) => t.mode === input.transportMode)) {
      exclusions.push({ destinationId: destination.id, reason: `no ${input.transportMode} option from U of T` });
      continue;
    }
    if (tripNights < destination.minTripNights) {
      exclusions.push({
        destinationId: destination.id,
        reason: `needs at least ${destination.minTripNights} night${destination.minTripNights > 1 ? "s" : ""} to be worth the travel (you have ${tripNights})`,
      });
      continue;
    }
    if (destination.oneWayTravelHours * 2 > totalWindowHours * 0.45) {
      exclusions.push({
        destinationId: destination.id,
        reason: `round-trip travel (~${destination.oneWayTravelHours * 2}h) would eat too much of your ${Math.round(totalWindowHours)}h window`,
      });
      continue;
    }
    const overTravel = destination.oneWayTravelHours > input.maxTravelHours;
    const overBudget = destination.weekendBudgetMinPerPerson > input.budgetPerPerson;
    if (overTravel) {
      exclusions.push({
        destinationId: destination.id,
        reason: `~${destination.oneWayTravelHours}h one-way exceeds your ${input.maxTravelHours}h travel limit`,
      });
      // eligible for relaxation if it's within one extra hour
      if (destination.oneWayTravelHours <= input.maxTravelHours + 1 && !overBudget) {
        nearMisses.push({ destination, relaxed: "travel-time" });
      }
      continue;
    }
    if (overBudget) {
      exclusions.push({
        destinationId: destination.id,
        reason: `realistic minimum ~$${destination.weekendBudgetMinPerPerson}/person exceeds your $${input.budgetPerPerson} budget`,
      });
      // eligible for relaxation if within 15%
      if (destination.weekendBudgetMinPerPerson <= input.budgetPerPerson * 1.15) {
        nearMisses.push({ destination, relaxed: "budget" });
      }
      continue;
    }
    survivors.push(destination);
  }

  const build = (
    destination: DestinationRecord,
    relaxed?: Recommendation["relaxedConstraint"],
  ): Recommendation => {
    const plan = selectPlan(destination, input.cravings, input.itineraryStructure, input.archetypeId);
    const hotel = selectHotel(destination, plan, input.accommodationStyle, input.budgetPerPerson, tripNights);
    const cost = tripTotal(destination, hotel, plan, tripNights);
    const score = scoreDestination(destination, input);
    return { destination, hotel, plan, cost, score, reasons: buildReasons(destination, input, cost, relaxed), relaxedConstraint: relaxed };
  };

  let recommendations = survivors
    .map((d) => build(d))
    .sort((a, b) => b.score.total - a.score.total);

  // Graceful fallback: top up from near-misses (travel-time first, then budget)
  if (recommendations.length < 3 && nearMisses.length > 0) {
    const topUps = nearMisses
      .sort((a, b) => (a.relaxed === "travel-time" ? -1 : 1) - (b.relaxed === "travel-time" ? -1 : 1))
      .map(({ destination, relaxed }) => build(destination, relaxed))
      .sort((a, b) => b.score.total - a.score.total);
    for (const candidate of topUps) {
      if (recommendations.length >= 3) break;
      if (!recommendations.some((r) => r.destination.id === candidate.destination.id)) {
        recommendations.push(candidate);
      }
    }
  }

  recommendations = recommendations.slice(0, 3);
  return { recommendations, exclusions, input };
}
