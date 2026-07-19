import type { TripPlan } from "./data/schema";
import type { RentVsEscapeStat } from "./types";

export interface TripCostBreakdown {
  accommodationPerPerson: number;
  accommodationTotal: number;
  transportPerPerson: number;
  foodPerPerson: number;
  activitiesPerPerson: number;
  totalPerPerson: number;
  groupSize: number;
  nights: number;
}

/** Transparent per-person math: hotel share + transport + the selected
 * plan's meal and activity estimates. `nightlyPrice` can come from live
 * Stay22 data or the catalog's mock hotel — same formula either way. */
export function calculateTripCost(args: {
  nightlyPrice: number;
  nights: number;
  groupSize: number;
  transportPerPerson: number;
  plan: TripPlan;
}): TripCostBreakdown {
  const { nightlyPrice, nights, groupSize, transportPerPerson, plan } = args;
  const accommodationTotal = nightlyPrice * Math.max(1, nights);
  const accommodationPerPerson = Math.round(accommodationTotal / groupSize);
  return {
    accommodationPerPerson,
    accommodationTotal,
    transportPerPerson,
    foodPerPerson: plan.mealCostPerPerson,
    activitiesPerPerson: plan.activityCostPerPerson,
    totalPerPerson:
      accommodationPerPerson + transportPerPerson + plan.mealCostPerPerson + plan.activityCostPerPerson,
    groupSize,
    nights,
  };
}

/**
 * The "big brain" Stay22 stat: takes the real nightly rate we already
 * fetched and reframes it as a monthly cost, set against a rough local
 * rent baseline. One multiplication, reusing data already in hand —
 * no extra API calls.
 */
export function rentVsEscape(
  nightlyPrice: number,
  destination: { name: string; approxMonthlyRent: number },
): RentVsEscapeStat {
  const monthlyEquivalent = Math.round(nightlyPrice * 30);
  const cityRent = destination.approxMonthlyRent;

  const message =
    monthlyEquivalent <= cityRent
      ? `At this nightly rate, living here full-time would run ~$${monthlyEquivalent.toLocaleString()}/mo — about what a 1BR costs in ${destination.name} anyway.`
      : `At this nightly rate, living here full-time would run ~$${monthlyEquivalent.toLocaleString()}/mo — more than a 1BR in ${destination.name}. Good thing it's just a weekend.`;

  return { monthlyEquivalent, cityRent, message };
}
