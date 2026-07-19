import type { SurveyAnswers, TripPreferences } from "./types";

/**
 * Seeded prototype profiles for "meet compatible people" mode. These are
 * NOT real Sonder users — fabricated for the hackathon demo only, each
 * with a full set of survey-style answers so they can be compared against
 * the current user with the same distance function used for archetypes.
 */
export interface SeedProfile {
  id: string;
  firstName: string;
  avatar: string;
  bio: string;
  budget: TripPreferences["budget"];
  companionship: TripPreferences["companionship"];
  answers: SurveyAnswers;
}

export const SEED_PROFILES: SeedProfile[] = [
  {
    id: "seed-1",
    firstName: "Maya",
    avatar: "/pfp1.png",
    bio: "Third-year comm student. Will talk your ear off about the café we're going to.",
    budget: "$300-400",
    companionship: "new_people",
    answers: { introversion: 75, planning: 55, pace: 50, novelty: 70, groupSize: 65, nightlife: 50, setting: 60, spend: 50, togetherness: 70, adventure: 55 },
  },
  {
    id: "seed-2",
    firstName: "Theo",
    avatar: "/pfp2.png",
    bio: "Needs a weekend that doesn't start before 10am. Non-negotiable.",
    budget: "$300-400",
    companionship: "new_people",
    answers: { introversion: 25, planning: 45, pace: 25, novelty: 40, groupSize: 25, nightlife: 20, setting: 35, spend: 40, togetherness: 45, adventure: 25 },
  },
  {
    id: "seed-3",
    firstName: "Priya",
    avatar: "/pfp3.png",
    bio: "Will organize the group chat, the itinerary, and probably your life.",
    budget: "$400-600",
    companionship: "new_people",
    answers: { introversion: 60, planning: 15, pace: 80, novelty: 65, groupSize: 55, nightlife: 40, setting: 55, spend: 60, togetherness: 60, adventure: 70 },
  },
  {
    id: "seed-4",
    firstName: "Jordan",
    avatar: "/pfp4.png",
    bio: "Down for whatever, as long as there's a good playlist involved.",
    budget: "$300-400",
    companionship: "new_people",
    answers: { introversion: 82, planning: 85, pace: 70, novelty: 80, groupSize: 75, nightlife: 78, setting: 65, spend: 55, togetherness: 65, adventure: 82 },
  },
  {
    id: "seed-5",
    firstName: "Aliyah",
    avatar: "/pfp5.png",
    bio: "Museum person. Will find the one good bookstore in any city.",
    budget: "$150-300",
    companionship: "new_people",
    answers: { introversion: 38, planning: 30, pace: 40, novelty: 78, groupSize: 30, nightlife: 22, setting: 75, spend: 38, togetherness: 32, adventure: 35 },
  },
  {
    id: "seed-6",
    firstName: "Sam",
    avatar: "/surveyblob1.png",
    bio: "Somewhere between 'let's plan everything' and 'let's not.'",
    budget: "$400-600",
    companionship: "new_people",
    answers: { introversion: 55, planning: 50, pace: 55, novelty: 55, groupSize: 50, nightlife: 45, setting: 50, spend: 55, togetherness: 55, adventure: 50 },
  },
  {
    id: "seed-7",
    firstName: "Devon",
    avatar: "/surveyblob2.png",
    bio: "Here for the food, honestly. Everything else is a bonus.",
    budget: "$300-400",
    companionship: "new_people",
    answers: { introversion: 65, planning: 60, pace: 45, novelty: 68, groupSize: 60, nightlife: 55, setting: 62, spend: 52, togetherness: 62, adventure: 48 },
  },
];
