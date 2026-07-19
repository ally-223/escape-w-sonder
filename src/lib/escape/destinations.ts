import type {
  Destination,
  DestinationId,
  SurveyAnswers,
  TripPreferences,
} from "./types";

export const DESTINATIONS: Record<DestinationId, Destination> = {
  montreal: {
    id: "montreal",
    name: "Montréal",
    province: "Québec",
    description:
      "Cafés, murals, and a food scene that rewards wandering without a plan.",
    heroImage: "/startpolaroid1.png",
    approxMonthlyRent: 1850,
  },
  toronto: {
    id: "toronto",
    name: "Toronto",
    province: "Ontario",
    description:
      "Big-city energy, late nights, and something new on every block.",
    heroImage: "/startpolaroid2.png",
    approxMonthlyRent: 2450,
  },
  "niagara-falls": {
    id: "niagara-falls",
    name: "Niagara Falls",
    province: "Ontario",
    description:
      "Slow mornings, big views, and nowhere you actually need to be.",
    heroImage: "/startpolaroid3.png",
    approxMonthlyRent: 1550,
  },
};

const BUDGET_MIDPOINT: Record<TripPreferences["budget"], number> = {
  "$150-300": 225,
  "$300-400": 350,
  "$400-600": 500,
  "$600+": 700,
};

export function budgetMidpoint(budget: TripPreferences["budget"]): number {
  return BUDGET_MIDPOINT[budget];
}

/**
 * Deterministic destination pick. Each city gets a score built from the
 * explicit sentence-picker choices (the stronger signal) plus a couple of
 * survey dimensions as a tiebreaker. Whichever score is highest wins;
 * Montréal is the tiebreaker default since it sits in the middle of the
 * nature/city and quiet/nightlife spectrum.
 */
export function pickDestination(
  answers: SurveyAnswers,
  preferences: TripPreferences,
): DestinationId {
  const scores: Record<DestinationId, number> = {
    montreal: 2, // slight default bias — the versatile middle option
    toronto: 0,
    "niagara-falls": 0,
  };

  if (preferences.vibe === "nature & quiet") scores["niagara-falls"] += 4;
  if (preferences.vibe === "nightlife & energy") scores.toronto += 4;
  if (preferences.vibe === "cafés & art") scores.montreal += 4;
  if (preferences.vibe === "food & culture") scores.montreal += 3;

  if (preferences.feel === "relaxing") scores["niagara-falls"] += 2;
  if (preferences.feel === "thrilling") scores.toronto += 2;
  if (preferences.feel === "spontaneous") scores.montreal += 1;
  if (preferences.feel === "nostalgic") scores["niagara-falls"] += 1;

  if (preferences.budget === "$150-300") scores["niagara-falls"] += 2;
  if (preferences.budget === "$600+") scores.toronto += 2;

  if (answers.setting < 40) scores["niagara-falls"] += 2;
  if (answers.setting > 60) scores.toronto += 1;

  if (answers.nightlife > 60) scores.toronto += 2;
  if (answers.nightlife < 30) scores["niagara-falls"] += 1;

  if (answers.novelty > 55) scores.montreal += 1;
  if (answers.groupSize > 60) scores.toronto += 1;
  if (answers.pace < 35) scores["niagara-falls"] += 1;

  return (Object.keys(scores) as DestinationId[]).reduce((best, id) =>
    scores[id] > scores[best] ? id : best,
  );
}
