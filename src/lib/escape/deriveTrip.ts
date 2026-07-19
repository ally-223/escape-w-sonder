import { scoreArchetype } from "./archetypes";
import { pickDestination } from "./destinations";
import type { DerivedTrip, TripResult } from "./types";

export function deriveTrip(trip: TripResult): DerivedTrip {
  return {
    ...trip,
    archetypeId: scoreArchetype(trip.answers),
    destinationId: pickDestination(trip.answers, trip.preferences),
  };
}
