import type {
  Accommodation,
  CostBreakdown,
  Destination,
  RentVsEscapeStat,
} from "./types";

const NIGHTS = 2;
/** Flat per-person estimate for regional transport (bus/train share or gas split). */
const TRANSPORT_PER_PERSON = 45;
/** Flat per-person estimate covering food + activities across the weekend. */
const FOOD_AND_ACTIVITIES_PER_PERSON = 130;

export function calculateCost(
  accommodation: Accommodation,
  groupSize: number,
): CostBreakdown {
  const accommodationTotal = accommodation.pricePerNightTotal * NIGHTS;
  const accommodationPerPerson = accommodationTotal / groupSize;

  return {
    accommodationTotal,
    accommodationPerPerson: Math.round(accommodationPerPerson),
    transportPerPerson: TRANSPORT_PER_PERSON,
    foodAndActivitiesPerPerson: FOOD_AND_ACTIVITIES_PER_PERSON,
    totalPerPerson: Math.round(
      accommodationPerPerson + TRANSPORT_PER_PERSON + FOOD_AND_ACTIVITIES_PER_PERSON,
    ),
    groupSize,
  };
}

/**
 * The "big brain" Stay22 stat: takes the real nightly rate we already
 * fetched and reframes it as a monthly cost, set against a rough local
 * rent baseline. One multiplication, reusing data already in hand —
 * no extra API calls.
 */
export function rentVsEscape(
  accommodation: Accommodation,
  destination: Destination,
): RentVsEscapeStat {
  const monthlyEquivalent = Math.round(accommodation.pricePerNightTotal * 30);
  const cityRent = destination.approxMonthlyRent;

  const message =
    monthlyEquivalent <= cityRent
      ? `At this nightly rate, living here full-time would run ~$${monthlyEquivalent.toLocaleString()}/mo — about what a 1BR near campus costs in ${destination.name} anyway.`
      : `At this nightly rate, living here full-time would run ~$${monthlyEquivalent.toLocaleString()}/mo — more than a 1BR in ${destination.name}. Good thing it's just a weekend.`;

  return { monthlyEquivalent, cityRent, message };
}
