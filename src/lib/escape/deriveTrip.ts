import { scoreArchetype } from "./archetypes";
import { calculatePersonalityType } from "./personalities";
import type { DerivedTrip, TripResult } from "./types";

export function deriveTrip(trip: TripResult): DerivedTrip {
  return {
    ...trip,
    archetypeId: scoreArchetype(trip.answers),
    personalityType: calculatePersonalityType(trip.answers),
  };
}
