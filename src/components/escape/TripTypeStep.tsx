"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InlineSelect, { type InlineSelectOption } from "./InlineSelect";
import { calculatePersonalityType } from "@/lib/escape/personalities";
import type { AccommodationStyle, CravingTag, ItineraryStructure } from "@/lib/escape/data/schema";
import type {
  BudgetRange,
  Companionship,
  GroupPersonality,
  SurveyAnswers,
  TravelParty,
  TripPace,
  TripPreferences,
  TripStyle,
  TripVibe,
} from "@/lib/escape/types";

const TRIP_STYLE_OPTIONS: InlineSelectOption<TripStyle>[] = [
  { value: "carefully planned", label: "carefully planned", description: "I want to know the schedule in advance" },
  { value: "lightly planned", label: "lightly planned", description: "Give me a plan with room to improvise" },
  { value: "spontaneous", label: "spontaneous", description: "A few surprises and last-minute decisions sound fun" },
  { value: "surprise me", label: "surprise me", description: "Choose almost everything for me" },
];

const TRAVEL_PARTY_OPTIONS: InlineSelectOption<TravelParty>[] = [
  { value: "my friends", label: "my friends", description: "Create a trip I can share with people I already know" },
  { value: "new people", label: "new people", description: "Match me with compatible Sonder users" },
  { value: "a mix of both", label: "a mix of both", description: "Let me invite friends and meet someone new" },
  { value: "I’m open to either", label: "open to either", description: "Choose whichever creates the best group" },
];

const GROUP_PERSONALITY_OPTIONS: InlineSelectOption<GroupPersonality>[] = [
  { value: "adventurous", label: "adventurous", description: "Excited to try unfamiliar activities" },
  { value: "easygoing", label: "easygoing", description: "Flexible and comfortable going with the flow" },
  { value: "social", label: "social", description: "Talkative, energetic, and excited to meet people" },
  { value: "thoughtful", label: "thoughtful", description: "Into deeper conversations and smaller groups" },
  { value: "curious", label: "curious", description: "Interested in culture, food, and local discoveries" },
  { value: "playful", label: "playful", description: "Likes unusual activities and a little chaos" },
];

const BUDGET_OPTIONS: InlineSelectOption<BudgetRange>[] = [
  { value: "Under $200", label: "under $200", description: "Keep it simple and very affordable" },
  { value: "$200–300", label: "$200–300", description: "Budget-friendly with a few paid activities" },
  { value: "$300–400", label: "$300–400", description: "Comfortable stay and a balanced itinerary" },
  { value: "$400–600", label: "$400–600", description: "Nicer accommodation and more experiences" },
  { value: "$600+", label: "$600+", description: "Prioritize the experience over cost" },
  { value: "Flexible", label: "flexible", description: "Find the best-value option" },
];

const VIBE_OPTIONS: InlineSelectOption<TripVibe>[] = [
  { value: "cafés & art", label: "cafés & art", description: "Galleries, neighbourhoods, bookstores, and coffee" },
  { value: "food & nightlife", label: "food & nightlife", description: "Restaurants, bars, live music, and late nights" },
  { value: "nature & wellness", label: "nature & wellness", description: "Trails, scenic views, spas, and slower activities" },
  { value: "active & outdoors", label: "active & outdoors", description: "Hiking, cycling, climbing, and movement" },
  { value: "local hidden gems", label: "local hidden gems", description: "Less touristy places and unexpected discoveries" },
  { value: "classic sightseeing", label: "classic sightseeing", description: "Famous landmarks and must-see attractions" },
  { value: "a little of everything", label: "a little of everything", description: "A balanced itinerary" },
  { value: "surprise me", label: "surprise me", description: "Let Sonder choose based on my personality" },
];

const PACE_OPTIONS: InlineSelectOption<TripPace>[] = [
  { value: "very relaxing", label: "very relaxing", description: "One or two activities with lots of free time" },
  { value: "relaxing", label: "relaxing", description: "A loose itinerary without rushing" },
  { value: "balanced", label: "balanced", description: "A clear plan with breaks between activities" },
  { value: "lively", label: "lively", description: "Several activities throughout the day" },
  { value: "packed", label: "packed", description: "Make the most of every hour" },
];

const VIBE_CRAVINGS: Record<TripVibe, CravingTag[]> = {
  "cafés & art": ["food-cafes", "art-culture"],
  "food & nightlife": ["food-cafes", "nightlife"],
  "nature & wellness": ["nature-outdoors", "wellness-relaxation"],
  "active & outdoors": ["nature-outdoors", "games-play"],
  "local hidden gems": ["hidden-gems", "local-events"],
  "classic sightseeing": ["art-culture", "local-events"],
  "a little of everything": ["food-cafes", "art-culture", "nature-outdoors"],
  "surprise me": [],
};

function accommodationForBudget(budget: BudgetRange): AccommodationStyle {
  if (budget === "Under $200" || budget === "$200–300" || budget === "Flexible") return "simple and affordable";
  if (budget === "$300–400") return "cozy and social";
  if (budget === "$400–600") return "private and comfortable";
  return "stylish and luxurious";
}

function structureForStyle(style: TripStyle, answers: SurveyAnswers): ItineraryStructure {
  if (style === "carefully planned") return "carefully planned";
  if (style === "lightly planned") return "loosely planned";
  if (style === "spontaneous") return "completely spontaneous";
  const personality = calculatePersonalityType(answers).id;
  if (personality === "steadyPlanner") return "carefully planned";
  if (personality === "socialCatalyst" || personality === "spontaneousExplorer") return "completely spontaneous";
  return "loosely planned";
}

function companionshipForParty(party: TravelParty, answers: SurveyAnswers): Companionship {
  if (party === "my friends") return "my friends";
  if (party === "new people") return "compatible new people";
  if (party === "a mix of both") return "a mix of both";
  return (answers.socialInitiation + answers.openness) / 2 >= 50 ? "compatible new people" : "my friends";
}

interface TripTypeStepProps {
  answers: SurveyAnswers;
  onComplete: (preferences: TripPreferences) => void;
}

export default function TripTypeStep({ answers, onComplete }: TripTypeStepProps) {
  const [tripStyle, setTripStyle] = useState<TripStyle>("spontaneous");
  const [travelParty, setTravelParty] = useState<TravelParty>("new people");
  const [groupPersonality, setGroupPersonality] = useState<GroupPersonality>("adventurous");
  const [budget, setBudget] = useState<BudgetRange>("$300–400");
  const [tripVibe, setTripVibe] = useState<TripVibe>("cafés & art");
  const [pace, setPace] = useState<TripPace>("relaxing");

  const handleSubmit = () => {
    onComplete({
      tripStyle,
      travelParty,
      groupPersonality,
      budget,
      tripVibe,
      pace,
      availabilityStart: "Friday evening",
      availabilityEnd: "Sunday afternoon",
      companionship: companionshipForParty(travelParty, answers),
      maxTravel: "3 hours away",
      accommodationStyle: accommodationForBudget(budget),
      cravings: VIBE_CRAVINGS[tripVibe],
      structure: structureForStyle(tripStyle, answers),
      groupSize: 4,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-3xl mx-auto space-y-10 text-center">
      <div className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">[ build your escape ]</p>
        <h2 className="text-2xl md:text-3xl font-serif font-light text-white">Fill in the blanks</h2>
      </div>

      <div className="text-xl md:text-2xl font-serif font-light leading-[2.25] text-white">
        I want a <InlineSelect label="trip style" value={tripStyle} options={TRIP_STYLE_OPTIONS} onChange={setTripStyle} /> weekend with{" "}
        <InlineSelect label="who to travel with" value={travelParty} options={TRAVEL_PARTY_OPTIONS} onChange={setTravelParty} /> who are{" "}
        <InlineSelect label="group personality" value={groupPersonality} options={GROUP_PERSONALITY_OPTIONS} onChange={setGroupPersonality} />. My budget is{" "}
        <InlineSelect label="budget per person" value={budget} options={BUDGET_OPTIONS} onChange={setBudget} />, my vibe is{" "}
        <InlineSelect label="trip vibe" value={tripVibe} options={VIBE_OPTIONS} onChange={setTripVibe} />, and I want the trip to feel{" "}
        <InlineSelect label="trip pace" value={pace} options={PACE_OPTIONS} onChange={setPace} /> rather than packed.
      </div>

      <p className="text-xs text-white/55">Includes estimated accommodation, transportation, food, and activities.</p>

      <button onClick={handleSubmit} className="inline-flex rounded-full border border-white/60 bg-white/10 px-8 py-3 text-sm tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/20">
        generate my escape
      </button>
    </motion.div>
  );
}
