import { SEED_PROFILES } from "./mockProfiles";
import type { CompatibleProfile, SurveyAnswers } from "./types";

const REASON_LABELS: Record<
  keyof SurveyAnswers,
  { low: string; high: string }
> = {
  introversion: { low: "you both know when to recharge solo for a bit", high: "you're both the ones getting the group to talk to strangers" },
  planning: { low: "you both like knowing the plan before you land", high: "neither of you needs the full itinerary mapped out" },
  pace: { low: "you both want to leave room to do nothing", high: "you both want to pack the weekend full" },
  novelty: { low: "you both know a good favourite is worth repeating", high: "you're both chasing something you haven't tried before" },
  groupSize: { low: "you both prefer keeping the crew small", high: "you both come alive in a bigger group" },
  nightlife: { low: "you'd both rather wind down early", high: "you're both in for a late one" },
  setting: { low: "you both want green space over skyline", high: "you're both drawn to the city buzz" },
  spend: { low: "you're both keeping the weekend budget-friendly", high: "neither of you is watching the bill too closely" },
  togetherness: { low: "you both value having your own time too", high: "you both want to do everything together" },
  adventure: { low: "you both just want to be comfortable", high: "you're both chasing the adventurous option" },
};

function distance(a: SurveyAnswers, b: SurveyAnswers): number {
  const keys = Object.keys(a) as (keyof SurveyAnswers)[];
  return Math.sqrt(keys.reduce((sum, key) => sum + (a[key] - b[key]) ** 2, 0));
}

const MAX_DISTANCE = Math.sqrt(10 * 100 ** 2);

function reasonsFor(user: SurveyAnswers, other: SurveyAnswers): [string, string] {
  const ranked = (Object.keys(user) as (keyof SurveyAnswers)[])
    .map((key) => ({ key, delta: Math.abs(user[key] - other[key]) }))
    .sort((a, b) => a.delta - b.delta);

  return ranked.slice(0, 2).map(({ key }) => {
    const value = (user[key] + other[key]) / 2;
    const labels = REASON_LABELS[key];
    return value >= 50 ? labels.high : labels.low;
  }) as [string, string];
}

/** Deterministic top-3 match by personality distance. Compatibility % is
 * clamped to a 55-98 floor/ceiling so results read naturally in a demo
 * (a "compatible people" feature showing a 12% match isn't useful UX). */
export function matchCompatiblePeople(answers: SurveyAnswers): CompatibleProfile[] {
  const ranked = SEED_PROFILES.map((profile) => ({
    profile,
    distance: distance(answers, profile.answers),
  })).sort((a, b) => a.distance - b.distance);

  return ranked.slice(0, 3).map(({ profile, distance: d }) => {
    const raw = 100 - (d / MAX_DISTANCE) * 100;
    const compatibility = Math.round(Math.min(98, Math.max(55, raw)));
    return {
      id: profile.id,
      firstName: profile.firstName,
      avatar: profile.avatar,
      bio: profile.bio,
      compatibility,
      reasons: reasonsFor(answers, profile.answers),
    };
  });
}
