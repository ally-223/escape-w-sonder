"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InlineSelect from "./InlineSelect";
import type {
  BudgetRange,
  TripFeel,
  TripPersonality,
  TripPreferences,
  TripVibe,
} from "@/lib/escape/types";

const PACE_OPTIONS = ["spontaneous", "planned"] as const;
const COMPANIONSHIP_OPTIONS = ["new people", "friends"] as const;
const PERSONALITY_OPTIONS: readonly TripPersonality[] = ["adventurous", "laid-back", "curious", "sociable"];
const BUDGET_OPTIONS: readonly BudgetRange[] = ["$150-300", "$300-400", "$400-600", "$600+"];
const VIBE_OPTIONS: readonly TripVibe[] = ["cafés & art", "nightlife & energy", "nature & quiet", "food & culture"];
const FEEL_OPTIONS: readonly TripFeel[] = ["relaxing", "thrilling", "spontaneous", "nostalgic"];

const DEFAULT_GROUP_SIZE = 4;

interface TripTypeStepProps {
  onComplete: (preferences: TripPreferences) => void;
}

export default function TripTypeStep({ onComplete }: TripTypeStepProps) {
  const [pace, setPace] = useState<(typeof PACE_OPTIONS)[number]>("spontaneous");
  const [companionshipLabel, setCompanionshipLabel] = useState<(typeof COMPANIONSHIP_OPTIONS)[number]>("new people");
  const [personality, setPersonality] = useState<TripPersonality>("adventurous");
  const [budget, setBudget] = useState<BudgetRange>("$300-400");
  const [vibe, setVibe] = useState<TripVibe>("cafés & art");
  const [feel, setFeel] = useState<TripFeel>("relaxing");

  const handleSubmit = () => {
    onComplete({
      pace,
      companionship: companionshipLabel === "friends" ? "friends" : "new_people",
      personality,
      budget,
      vibe,
      feel,
      nights: 2,
      groupSize: DEFAULT_GROUP_SIZE,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto space-y-10 text-center"
    >
      <div className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
          [ build your escape ]
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-light text-white">
          Fill in the blanks
        </h2>
      </div>

      <p className="text-2xl md:text-3xl font-serif font-light leading-relaxed text-white">
        I want a <InlineSelect label="pace" value={pace} options={PACE_OPTIONS} onChange={setPace} /> weekend
        with <InlineSelect label="companionship" value={companionshipLabel} options={COMPANIONSHIP_OPTIONS} onChange={setCompanionshipLabel} /> who
        are <InlineSelect label="personality" value={personality} options={PERSONALITY_OPTIONS} onChange={setPersonality} />. My budget
        is <InlineSelect label="budget" value={budget} options={BUDGET_OPTIONS} onChange={setBudget} />, my vibe
        is <InlineSelect label="vibe" value={vibe} options={VIBE_OPTIONS} onChange={setVibe} />, and I want the trip
        to feel <InlineSelect label="feel" value={feel} options={FEEL_OPTIONS} onChange={setFeel} />.
      </p>

      <button
        onClick={handleSubmit}
        className="inline-flex rounded-full border border-white/60 bg-white/10 px-8 py-3 text-sm tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/20"
      >
        generate my escape
      </button>
    </motion.div>
  );
}
