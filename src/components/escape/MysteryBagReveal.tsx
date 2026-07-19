"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";
import type { Recommendation } from "@/lib/escape/recommend";
import { availabilityWindow } from "@/lib/escape/dates";
import type { TripPreferences } from "@/lib/escape/types";

interface MysteryBagRevealProps {
  recommendations: Recommendation[];
  preferences: TripPreferences;
  onPick: (recommendation: Recommendation) => void;
  onAdjust: () => void;
}

/** The Sonder blind-box moment: a mystery bag you rip open to reveal
 * three trip options. Mirrors the main app's weekly mystery-box drop. */
export default function MysteryBagReveal({
  recommendations,
  preferences,
  onPick,
  onAdjust,
}: MysteryBagRevealProps) {
  const [stage, setStage] = useState<"bag" | "ripping" | "options">("bag");

  const rip = () => {
    if (stage !== "bag") return;
    setStage("ripping");
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ["#dcff73", "#fff9ed", "#b7a58c"],
    });
    setTimeout(() => setStage("options"), 750);
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center space-y-4 max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto relative opacity-60">
          <Image src="/fullbag.png" alt="" fill className="object-contain" />
        </div>
        <p className="text-sm text-[#a1a1aa]">
          blob searched everywhere, but nothing fits that budget, window, and travel range together.
        </p>
        <button
          onClick={onAdjust}
          className="rounded-full px-6 py-3 text-sm font-medium"
          style={{ background: "#dcff73", color: "#0a0a0b" }}
        >
          Adjust my blanks
        </button>
      </div>
    );
  }

  const window = availabilityWindow(preferences.availabilityStart, preferences.availabilityEnd);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {stage !== "options" && (
          <motion.div
            key="bag"
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <p className="text-[10px] tracking-[0.22em] uppercase font-medium font-mono" style={{ color: "#dcff73" }}>
              [ your escape is ready ]
            </p>
            <motion.button
              onClick={rip}
              className="relative w-56 h-56 mx-auto block cursor-pointer"
              animate={
                stage === "bag"
                  ? { rotate: [-2, 2, -2], y: [0, -4, 0] }
                  : { rotate: [0, -8, 6, 0], scale: [1, 1.08, 1.02] }
              }
              transition={
                stage === "bag"
                  ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.6 }
              }
              whileHover={{ scale: 1.06 }}
              aria-label="Rip open the mystery bag"
            >
              <Image
                src={stage === "ripping" ? "/bagripped.png" : "/fullbag.png"}
                alt=""
                fill
                className="object-contain drop-shadow-[0_0_35px_rgba(220,255,115,0.25)]"
              />
            </motion.button>
            <p className="text-sm text-[#a1a1aa]">
              {stage === "ripping" ? "..." : "rip it open"}
            </p>
          </motion.div>
        )}

        {stage === "options" && (
          <motion.div
            key="options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-1">
              <p className="text-[10px] tracking-[0.22em] uppercase font-medium font-mono" style={{ color: "#dcff73" }}>
                [ three escapes made it into your bag ]
              </p>
              <p className="text-sm text-[#a1a1aa]">{window.label} · pick one</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec, i) => (
                <motion.button
                  key={rec.destination.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.12 }}
                  onClick={() => onPick(rec)}
                  className="holo-card rounded-3xl overflow-hidden text-left group"
                >
                  <div className="relative w-full h-32">
                    <Image src={rec.destination.heroImage} alt={rec.destination.name} fill className="object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, transparent 30%, #0a0a0b 100%)" }}
                    />
                    {i === 0 && (
                      <span
                        className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full font-medium"
                        style={{ background: "#dcff73", color: "#0a0a0b" }}
                      >
                        best match
                      </span>
                    )}
                    {rec.relaxedConstraint && (
                      <span
                        className="absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(10,10,11,0.7)", color: "#b7a58c", border: "1px solid #3f3f46" }}
                      >
                        {rec.relaxedConstraint === "travel-time" ? "a bit farther" : "a bit over budget"}
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-3 relative z-10">
                    <div>
                      <h3 className="text-xl font-serif font-light text-[#f5f5f4]">{rec.destination.name}</h3>
                      <p className="text-xs text-[#a1a1aa] mt-0.5">
                        ~{rec.destination.oneWayTravelHours}h away · {rec.plan.title}
                      </p>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">{rec.plan.vibe}</p>
                    <div className="flex items-end justify-between pt-1">
                      <span className="text-[10px] text-[#71717a] uppercase tracking-wide">est. per person</span>
                      <span className="text-lg font-serif" style={{ color: "#dcff73" }}>
                        ${rec.cost.total}
                      </span>
                    </div>
                    <div
                      className="w-full py-2.5 rounded-full text-xs font-medium text-center transition-opacity group-hover:opacity-90"
                      style={{ background: "#dcff73", color: "#0a0a0b" }}
                    >
                      Take this one
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <button onClick={onAdjust} className="text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors">
                ← none of these — adjust my blanks
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
