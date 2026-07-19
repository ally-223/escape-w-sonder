"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InlineSelect from "./InlineSelect";
import InlineMultiSelect from "./InlineMultiSelect";
import { CRAVING_LABELS } from "@/lib/escape/recommend";
import type { AccommodationStyle, CravingTag, ItineraryStructure } from "@/lib/escape/data/schema";
import type {
  AvailabilityEnd,
  AvailabilityStart,
  BudgetRange,
  Companionship,
  TravelDistance,
  TripPreferences,
} from "@/lib/escape/types";

const START_OPTIONS: readonly AvailabilityStart[] = ["Friday afternoon", "Friday evening", "Saturday morning", "Saturday afternoon"];
const END_OPTIONS: readonly AvailabilityEnd[] = ["Saturday evening", "Sunday afternoon", "Sunday evening", "Monday morning"];
const COMPANIONSHIP_OPTIONS: readonly Companionship[] = ["my friends", "compatible new people", "a mix of both", "surprise me"];
const BUDGET_OPTIONS: readonly BudgetRange[] = ["Under $200", "$200–300", "$300–400", "$400–600", "$600+"];
const DISTANCE_OPTIONS: readonly TravelDistance[] = ["1 hour away", "3 hours away", "5 hours away", "anywhere reachable"];
const STYLE_OPTIONS: readonly AccommodationStyle[] = ["simple and affordable", "cozy and social", "private and comfortable", "unique and memorable", "stylish and luxurious"];
const STRUCTURE_OPTIONS: readonly ItineraryStructure[] = ["completely spontaneous", "loosely planned", "a balanced schedule", "carefully planned"];

const CRAVING_OPTIONS = (Object.keys(CRAVING_LABELS) as CravingTag[]).map((value) => ({
  value,
  label: CRAVING_LABELS[value],
}));

const DEFAULT_GROUP_SIZE = 4;

interface TripTypeStepProps {
  onComplete: (preferences: TripPreferences) => void;
}

export default function TripTypeStep({ onComplete }: TripTypeStepProps) {
  const [availabilityStart, setAvailabilityStart] = useState<AvailabilityStart>("Friday evening");
  const [availabilityEnd, setAvailabilityEnd] = useState<AvailabilityEnd>("Sunday afternoon");
  const [companionship, setCompanionship] = useState<Companionship>("compatible new people");
  const [budget, setBudget] = useState<BudgetRange>("$300–400");
  const [maxTravel, setMaxTravel] = useState<TravelDistance>("3 hours away");
  const [accommodationStyle, setAccommodationStyle] = useState<AccommodationStyle>("cozy and social");
  const [cravings, setCravings] = useState<CravingTag[]>(["food-cafes", "hidden-gems"]);
  const [structure, setStructure] = useState<ItineraryStructure>("loosely planned");

  const handleSubmit = () => {
    onComplete({
      availabilityStart,
      availabilityEnd,
      companionship,
      budget,
      maxTravel,
      accommodationStyle,
      cravings,
      structure,
      groupSize: DEFAULT_GROUP_SIZE,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-3xl mx-auto space-y-10 text-center"
    >
      <div className="space-y-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
          [ build your escape ]
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-light text-white">
          Fill in the blanks
        </h2>
      </div>

      <div className="text-xl md:text-2xl font-serif font-light leading-loose text-white">
        I&apos;m free from{" "}
        <InlineSelect label="availability start" value={availabilityStart} options={START_OPTIONS} onChange={setAvailabilityStart} /> to{" "}
        <InlineSelect label="availability end" value={availabilityEnd} options={END_OPTIONS} onChange={setAvailabilityEnd} />, and I want to
        travel with <InlineSelect label="companionship" value={companionship} options={COMPANIONSHIP_OPTIONS} onChange={setCompanionship} />.
        I&apos;m comfortable spending around{" "}
        <InlineSelect label="budget" value={budget} options={BUDGET_OPTIONS} onChange={setBudget} />, travelling up to{" "}
        <InlineSelect label="travel distance" value={maxTravel} options={DISTANCE_OPTIONS} onChange={setMaxTravel} />, and staying
        somewhere <InlineSelect label="accommodation style" value={accommodationStyle} options={STYLE_OPTIONS} onChange={setAccommodationStyle} />.
        For this escape, I&apos;m craving{" "}
        <InlineMultiSelect
          label="cravings"
          values={cravings}
          options={CRAVING_OPTIONS}
          onChange={(v) => setCravings(v as CravingTag[])}
          max={3}
          emptyLabel="surprise me"
        />{" "}
        with a <InlineSelect label="itinerary structure" value={structure} options={STRUCTURE_OPTIONS} onChange={setStructure} /> itinerary.
      </div>

      <button
        onClick={handleSubmit}
        className="inline-flex rounded-full border border-white/60 bg-white/10 px-8 py-3 text-sm tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/20"
      >
        generate my escape
      </button>
    </motion.div>
  );
}
