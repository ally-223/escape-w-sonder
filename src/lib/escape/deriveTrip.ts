import { scoreArchetype } from "./archetypes";
import type { DerivedTrip, TripResult } from "./types";

/** The archetype is the only derived field left — destination, plan, and
 * hotel are stored on the trip because the user chose them from the
 * three revealed options. */
export function deriveTrip(trip: TripResult): DerivedTrip {
  return {
    ...trip,
    archetypeId: scoreArchetype(trip.answers),
  };
}
