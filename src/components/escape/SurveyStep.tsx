"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SliderQuestion from "./SliderQuestion";
import ChoiceQuestion from "./ChoiceQuestion";
import { SURVEY_QUESTIONS } from "@/lib/escape/surveyQuestions";
import { ARCHETYPES, scoreArchetype } from "@/lib/escape/archetypes";
import type { DimensionKey, EscapeProfile, SurveyAnswers } from "@/lib/escape/types";

const BLOBS = ["pfp1", "pfp2", "pfp3", "pfp4", "pfp5"];

/** Seeded prototype stat — derived from the answers so it's stable per
 * user, but it is NOT a real percentage of Sonder users. Demo only. */
function mockMatchPercent(answers: Partial<Record<DimensionKey, number>>): number {
  const sum = Object.values(answers).reduce((a, b) => a + (b ?? 0), 0);
  return 58 + (sum % 31); // always lands in 58-88
}

interface SurveyStepProps {
  onComplete: (answers: SurveyAnswers, profile: EscapeProfile) => void;
}

export default function SurveyStep({ onComplete }: SurveyStepProps) {
  // Steps 0-9: questions. Step 10: profile. Step 11: archetype reveal.
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<DimensionKey, number>>>({});
  const [name, setName] = useState("");
  const [pfp, setPfp] = useState("");
  const [showPfpOptions, setShowPfpOptions] = useState(false);

  const totalSteps = SURVEY_QUESTIONS.length + 2;
  const isQuestion = step < SURVEY_QUESTIONS.length;
  const isProfile = step === SURVEY_QUESTIONS.length;
  const isArchetypeReveal = step === SURVEY_QUESTIONS.length + 1;

  const question = isQuestion ? SURVEY_QUESTIONS[step] : null;
  const currentAnswer = question ? answers[question.key] : undefined;

  const setAnswer = (value: number) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const canProceed = () => {
    if (isQuestion && question) {
      if (question.type === "slider") return true; // slider always has a value
      return answers[question.key] !== undefined;
    }
    if (isProfile) return name.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (isQuestion && question?.type === "slider" && answers[question.key] === undefined) {
      // slider left at the default midpoint still counts as an answer
      setAnswers((prev) => ({ ...prev, [question.key]: 50 }));
    }
    if (isArchetypeReveal) {
      onComplete(
        { ...Object.fromEntries(SURVEY_QUESTIONS.map((q) => [q.key, answers[q.key] ?? 50])) } as SurveyAnswers,
        { name: name.trim(), pfp: pfp || "pfp1" },
      );
      return;
    }
    setStep(step + 1);
  };

  const headerTitle = isProfile
    ? "Complete Your Profile"
    : isArchetypeReveal
      ? "your travel personality"
      : question?.section ?? "";

  const matchPercent = mockMatchPercent(answers);
  const fullAnswers = Object.fromEntries(
    SURVEY_QUESTIONS.map((q) => [q.key, answers[q.key] ?? 50]),
  ) as SurveyAnswers;
  const archetype = isArchetypeReveal ? ARCHETYPES[scoreArchetype(fullAnswers)] : null;

  return (
    <div className="relative max-w-2xl w-full space-y-8">
      {/* Progress bar — Sonder survey header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-light text-white flex items-center gap-2">
            {isQuestion && step <= 2 ? (
              <img
                src={`/q${step + 1}.png`}
                alt=""
                className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0"
              />
            ) : null}
            {headerTitle}
          </h2>
          <span className="text-sm text-white/60">
            {step + 1} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-300 bg-[#dcff73]"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-6"
        >
          {isQuestion && question && (
            question.type === "slider" ? (
              <SliderQuestion
                question={question.prompt}
                minLabel={question.lowLabel}
                maxLabel={question.highLabel}
                selectedAnswer={currentAnswer}
                onAnswer={setAnswer}
              />
            ) : (
              <ChoiceQuestion
                question={question.prompt}
                variant={question.type}
                lowLabel={question.lowLabel}
                highLabel={question.highLabel}
                lowHint={question.lowHint}
                highHint={question.highHint}
                selectedAnswer={currentAnswer}
                onAnswer={setAnswer}
              />
            )
          )}

          {isProfile && (
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-serif font-light text-center text-white">
                Make it yours
              </h3>
              <p className="text-white/60 text-center text-sm">
                Your blob fronts your escape when you share it.
              </p>

              <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/20 p-6 space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPfpOptions((prev) => !prev)}
                    className="relative transition-opacity hover:opacity-90"
                  >
                    <div className="absolute" style={{ top: "19%", bottom: "26%", left: "11%", right: "14%" }}>
                      {pfp ? (
                        <img src={`/${pfp}.png`} alt={`${pfp} avatar`} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-center text-[11px] text-white leading-tight px-1">
                          pick your blob
                        </div>
                      )}
                    </div>
                    <img src="/polaroidframetape.png" alt="" className="relative z-10 block w-36" />
                  </button>

                  {showPfpOptions && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {BLOBS.map((blob) => {
                        const isSelected = pfp === blob;
                        return (
                          <button
                            key={blob}
                            type="button"
                            onClick={() => {
                              setPfp((prev) => (prev === blob ? "" : blob));
                              setShowPfpOptions(false);
                            }}
                            className={`relative transition-all duration-200 ${
                              isSelected
                                ? "scale-110 drop-shadow-[0_2px_10px_rgba(220,255,115,0.65)]"
                                : "opacity-75 hover:opacity-100 hover:scale-105"
                            }`}
                            aria-pressed={isSelected}
                            aria-label={`Select ${blob} profile picture`}
                          >
                            <div className="absolute" style={{ top: "19%", bottom: "26%", left: "11%", right: "14%" }}>
                              <img src={`/${blob}.png`} alt="" className="w-full h-full object-contain" />
                            </div>
                            <img src="/polaroidframetape.png" alt="" className="relative z-10 block w-14" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Displayed Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-[#dcff73]/60 transition-colors text-white placeholder-white/40"
                  />
                </div>
              </div>
            </div>
          )}

          {isArchetypeReveal && archetype && (
            <div className="space-y-5 text-center">
              <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
                [ your travel personality is ]
              </p>
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden">
                <img src={archetype.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-serif font-light text-white">
                  {archetype.name}
                </h3>
                <p className="text-white/60 text-sm">{archetype.tagline}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {archetype.traits.map((trait) => (
                  <span
                    key={trait}
                    className="text-xs px-3 py-1 rounded-full border border-white/30 bg-white/5 text-white backdrop-blur-md"
                  >
                    {trait}
                  </span>
                ))}
              </div>
              <p className="text-white/60 text-sm">
                {name.trim() ? `${name.trim()}, you` : "You"} vibe with{" "}
                <span style={{ color: "#dcff73" }}>{matchPercent}%</span> of sidequesters.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-sm tracking-[0.14em] rounded-full border border-white/30 bg-white/5 text-white/70 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
          >
            ← Back
          </button>
        ) : (
          <div></div>
        )}

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-6 py-3 text-sm tracking-[0.14em] rounded-full border backdrop-blur-md transition ${
            canProceed()
              ? "border-white/60 bg-white/10 text-white hover:bg-white/20"
              : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
          }`}
        >
          {isArchetypeReveal ? "Build my escape →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
