import type { Archetype, ArchetypeId, SurveyAnswers } from "./types";

/**
 * Deterministic archetype scoring. Each archetype has an "ideal" 0-100
 * profile (its centroid); we score the user's answers against every
 * centroid with a weighted Euclidean distance and pick the closest one.
 * No ML — just arithmetic, and the centroids below are the only thing
 * you need to touch to retune matching.
 */
export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  "curious-connector": {
    id: "curious-connector",
    name: "The Curious Connector",
    tagline: "You travel for the people you'll meet, not just the places.",
    traits: ["Warm", "Curious", "Easy to talk to"],
    image: "/pfp1.png",
    centroid: {
      introversion: 78,
      planning: 50,
      pace: 55,
      novelty: 72,
      groupSize: 68,
      nightlife: 55,
      setting: 58,
      spend: 50,
      togetherness: 75,
      adventure: 58,
    },
  },
  "cozy-wanderer": {
    id: "cozy-wanderer",
    name: "The Cozy Wanderer",
    tagline: "A slow morning and a good window seat beats a packed itinerary.",
    traits: ["Gentle", "Grounded", "Detail-loving"],
    image: "/pfp2.png",
    centroid: {
      introversion: 22,
      planning: 40,
      pace: 20,
      novelty: 35,
      groupSize: 20,
      nightlife: 15,
      setting: 30,
      spend: 42,
      togetherness: 42,
      adventure: 20,
    },
  },
  "social-explorer": {
    id: "social-explorer",
    name: "The Social Explorer",
    tagline: "The itinerary is really just an excuse to gather people.",
    traits: ["Magnetic", "Spontaneous-ish", "Always down"],
    image: "/pfp3.png",
    centroid: {
      introversion: 85,
      planning: 48,
      pace: 65,
      novelty: 65,
      groupSize: 82,
      nightlife: 80,
      setting: 75,
      spend: 60,
      togetherness: 72,
      adventure: 62,
    },
  },
  "intentional-adventurer": {
    id: "intentional-adventurer",
    name: "The Intentional Adventurer",
    tagline: "You'll plan the whole thing if it means doing it right.",
    traits: ["Driven", "Prepared", "Quietly ambitious"],
    image: "/pfp4.png",
    centroid: {
      introversion: 48,
      planning: 20,
      pace: 75,
      novelty: 70,
      groupSize: 45,
      nightlife: 35,
      setting: 52,
      spend: 65,
      togetherness: 55,
      adventure: 82,
    },
  },
  "chaos-tourist": {
    id: "chaos-tourist",
    name: "The Chaos Tourist",
    tagline: "The plan is that there is no plan.",
    traits: ["Unfiltered", "Fast-moving", "Down for anything"],
    image: "/pfp5.png",
    centroid: {
      introversion: 68,
      planning: 92,
      pace: 82,
      novelty: 85,
      groupSize: 62,
      nightlife: 72,
      setting: 60,
      spend: 55,
      togetherness: 58,
      adventure: 90,
    },
  },
  "culture-collector": {
    id: "culture-collector",
    name: "The Culture Collector",
    tagline: "You want a trip you can talk about for the right reasons.",
    traits: ["Observant", "A little particular", "Independent"],
    image: "/surveyblob1.png",
    centroid: {
      introversion: 40,
      planning: 25,
      pace: 45,
      novelty: 80,
      groupSize: 32,
      nightlife: 25,
      setting: 78,
      spend: 42,
      togetherness: 35,
      adventure: 38,
    },
  },
};

export const ARCHETYPE_ORDER: ArchetypeId[] = [
  "curious-connector",
  "cozy-wanderer",
  "social-explorer",
  "intentional-adventurer",
  "chaos-tourist",
  "culture-collector",
];

function distance(a: SurveyAnswers, b: SurveyAnswers): number {
  const keys = Object.keys(a) as (keyof SurveyAnswers)[];
  return Math.sqrt(
    keys.reduce((sum, key) => sum + (a[key] - b[key]) ** 2, 0),
  );
}

export function scoreArchetype(answers: SurveyAnswers): ArchetypeId {
  let best: ArchetypeId = ARCHETYPE_ORDER[0];
  let bestDistance = Infinity;

  for (const id of ARCHETYPE_ORDER) {
    const d = distance(answers, ARCHETYPES[id].centroid);
    if (d < bestDistance) {
      bestDistance = d;
      best = id;
    }
  }

  return best;
}

const DIMENSION_LABELS: Record<
  keyof SurveyAnswers,
  { low: string; high: string }
> = {
  introversion: { low: "how you recharge solo", high: "how much you light up around people" },
  planning: { low: "how much you like a plan", high: "how well you go with the flow" },
  pace: { low: "how much you protect downtime", high: "how much you pack into a day" },
  novelty: { low: "how much you love a familiar favourite", high: "how much you chase new experiences" },
  groupSize: { low: "how much you value a small crew", high: "how much bigger groups energize you" },
  nightlife: { low: "how much you love a quiet evening", high: "how much you love a night out" },
  setting: { low: "your pull toward nature", high: "your pull toward city energy" },
  spend: { low: "how deliberate you are with money", high: "how willing you are to splurge" },
  togetherness: { low: "how much you protect independent time", high: "how much you want to do everything together" },
  adventure: { low: "how much comfort matters to you", high: "how much you chase adventure" },
};

/** Picks the two dimensions where the user's answer diverges most from
 * neutral (50), and turns them into a plain-language "why this trip" line. */
export function explainMatch(answers: SurveyAnswers): [string, string] {
  const ranked = (Object.keys(answers) as (keyof SurveyAnswers)[])
    .map((key) => ({ key, delta: Math.abs(answers[key] - 50) }))
    .sort((a, b) => b.delta - a.delta);

  return ranked.slice(0, 2).map(({ key }) => {
    const value = answers[key];
    const labels = DIMENSION_LABELS[key];
    return value >= 50 ? labels.high : labels.low;
  }) as [string, string];
}
