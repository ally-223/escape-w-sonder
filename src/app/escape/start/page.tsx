"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SurveyStep from "@/components/escape/SurveyStep";
import TripTypeStep from "@/components/escape/TripTypeStep";
import LoadingSequence from "@/components/escape/LoadingSequence";
import MysteryBagReveal from "@/components/escape/MysteryBagReveal";
import { scoreArchetype } from "@/lib/escape/archetypes";
import { recommend, preferencesToInput, type Recommendation } from "@/lib/escape/recommend";
import { encodeTrip } from "@/lib/escape/tripEncoding";
import type { EscapeProfile, SurveyAnswers, TripPreferences, TripResult } from "@/lib/escape/types";

type Stage = "survey" | "trip-type" | "loading" | "reveal";

export default function EscapeStartPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("survey");
  const [answers, setAnswers] = useState<SurveyAnswers | null>(null);
  const [profile, setProfile] = useState<EscapeProfile | null>(null);
  const [preferences, setPreferences] = useState<TripPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleSurveyComplete = (finishedAnswers: SurveyAnswers, finishedProfile: EscapeProfile) => {
    setAnswers(finishedAnswers);
    setProfile(finishedProfile);
    setStage("trip-type");
  };

  const handleTripTypeComplete = (finishedPreferences: TripPreferences) => {
    if (!answers) return;
    setPreferences(finishedPreferences);
    const archetypeId = scoreArchetype(answers);
    const result = recommend(preferencesToInput(finishedPreferences, archetypeId));
    setRecommendations(result.recommendations);
    setStage("loading");
  };

  const handlePick = (recommendation: Recommendation) => {
    if (!answers || !preferences) return;
    const trip: TripResult = {
      answers,
      preferences,
      destinationId: recommendation.destination.id,
      planId: recommendation.plan.id,
      hotelId: recommendation.hotel.id,
      profile: profile ?? undefined,
      createdAt: Date.now(),
    };
    router.push(`/escape/trip?d=${encodeTrip(trip)}`);
  };

  const isWarmStage = stage === "survey" || stage === "trip-type";

  if (isWarmStage) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#b7a58c] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url(/surveybg.png)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          key={stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full flex justify-center"
        >
          {stage === "survey" && <SurveyStep onComplete={handleSurveyComplete} />}
          {stage === "trip-type" && answers && (
            <TripTypeStep answers={answers} onComplete={handleTripTypeComplete} />
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4] flex flex-col items-center justify-center p-6 relative selection:bg-[#dcff73]/30 grain-overlay">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#dcff73]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#b7a58c]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        key={stage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {stage === "loading" && <LoadingSequence onComplete={() => setStage("reveal")} />}
        {stage === "reveal" && preferences && (
          <MysteryBagReveal
            recommendations={recommendations}
            preferences={preferences}
            onPick={handlePick}
            onAdjust={() => setStage("trip-type")}
          />
        )}
      </motion.div>
    </div>
  );
}
