"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SurveyStep from "@/components/escape/SurveyStep";
import TripTypeStep from "@/components/escape/TripTypeStep";
import LoadingSequence from "@/components/escape/LoadingSequence";
import RevealSequence from "@/components/escape/RevealSequence";
import { deriveTrip } from "@/lib/escape/deriveTrip";
import { encodeTrip } from "@/lib/escape/tripEncoding";
import type { EscapeProfile, SurveyAnswers, TripPreferences, TripResult } from "@/lib/escape/types";

type Stage = "survey" | "trip-type" | "loading" | "reveal";

export default function EscapeStartPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("survey");
  const [answers, setAnswers] = useState<SurveyAnswers | null>(null);
  const [profile, setProfile] = useState<EscapeProfile | null>(null);
  const [trip, setTrip] = useState<TripResult | null>(null);

  const handleSurveyComplete = (finishedAnswers: SurveyAnswers, finishedProfile: EscapeProfile) => {
    setAnswers(finishedAnswers);
    setProfile(finishedProfile);
    setStage("trip-type");
  };

  const handleTripTypeComplete = (preferences: TripPreferences) => {
    if (!answers) return;
    setTrip({ answers, preferences, profile: profile ?? undefined, createdAt: Date.now() });
    setStage("loading");
  };

  const handleRevealComplete = () => {
    if (!trip) return;
    router.push(`/escape/trip?d=${encodeTrip(trip)}`);
  };

  const derived = trip ? deriveTrip(trip) : null;
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
          {stage === "trip-type" && <TripTypeStep onComplete={handleTripTypeComplete} />}
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
        {stage === "reveal" && derived && (
          <RevealSequence
            archetypeId={derived.archetypeId}
            destinationId={derived.destinationId}
            answers={derived.answers}
            onComplete={handleRevealComplete}
          />
        )}
      </motion.div>
    </div>
  );
}
