"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";
import TripOptionCard from "./TripOptionCard";
import type { Recommendation } from "@/lib/escape/recommend";
import { availabilityWindow } from "@/lib/escape/dates";
import type { TripPreferences } from "@/lib/escape/types";

interface MysteryBagRevealProps {
  recommendations: Recommendation[];
  preferences: TripPreferences;
  onPick: (recommendation: Recommendation) => void;
  onAdjust: () => void;
}

export default function MysteryBagReveal({ recommendations, preferences, onPick, onAdjust }: MysteryBagRevealProps) {
  const [stage, setStage] = useState<"bag" | "ripping" | "options">("bag");
  const [progress, setProgress] = useState(0);
  const bagRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hasRipped = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, []);

  const rip = () => {
    if (stage !== "bag" || hasRipped.current) return;
    hasRipped.current = true;
    setProgress(1);
    setStage("ripping");
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 }, colors: ["#dcff73", "#fff9ed", "#b7a58c"] });
    revealTimer.current = setTimeout(() => setStage("options"), 750);
  };

  const updateProgress = (clientX: number) => {
    const rect = bagRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(next);
    if (next >= 0.92) rip();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stage !== "bag") return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateProgress(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) updateProgress(event.clientX);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!hasRipped.current && stage === "bag" && progress < 0.92) setProgress(0);
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center space-y-4 max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto relative opacity-60"><Image src="/fullbag.png" alt="" fill className="object-contain" /></div>
        <p className="text-sm text-[#a1a1aa]">blob searched everywhere, but nothing fits that budget, window, and travel range together.</p>
        <button onClick={onAdjust} className="rounded-full px-6 py-3 text-sm font-medium" style={{ background: "#dcff73", color: "#0a0a0b" }}>Adjust my blanks</button>
      </div>
    );
  }

  const window = availabilityWindow(preferences.availabilityStart, preferences.availabilityEnd);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {stage !== "options" && (
          <motion.div key="bag" exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.3 }} className="text-center space-y-5">
            <p className="text-[10px] tracking-[0.22em] uppercase font-medium font-mono text-[#dcff73]">[ your escape is ready ]</p>
            <div
              ref={bagRef}
              role="button"
              tabIndex={0}
              aria-label="Slide across or press Enter to rip open the mystery bag"
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); rip(); } }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="relative mx-auto w-full max-w-[420px] select-none touch-none cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dcff73] rounded-3xl"
            >
              <motion.img
                src={stage === "ripping" ? "/bagripped.png" : "/fullbag.png"}
                alt={stage === "ripping" ? "Ripped mystery bag" : "Closed mystery bag"}
                draggable={false}
                className="w-full h-auto pointer-events-none drop-shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                animate={stage === "ripping" ? { rotate: [0, -5, 3, 0], scale: [1, 1.04, 1] } : { y: [0, -3, 0] }}
                transition={stage === "ripping" ? { duration: 0.55 } : { duration: 1.8, repeat: Infinity }}
              />
              {stage === "bag" && (
                <>
                  <div className="absolute left-[12%] right-[12%] top-[14%] border-t border-dashed border-white/80" aria-hidden="true" />
                  <div className="absolute -translate-x-1/2 drop-shadow-md" style={{ top: "calc(14% - 16px)", left: `calc(12% + ${progress * 76}%)` }} aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <circle cx="5" cy="6" r="2.8" stroke="white" strokeWidth="1.4" />
                      <circle cx="5" cy="18" r="2.8" stroke="white" strokeWidth="1.4" />
                      <line x1="7.2" y1="7.8" x2="22" y2="20.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                      <line x1="7.2" y1="16.2" x2="22" y2="3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                </>
              )}
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">{stage === "ripping" ? "opening…" : "slide to open →"}</p>
            {stage === "bag" && (
              <button type="button" onClick={rip} className="text-xs text-white/55 underline underline-offset-4 transition-colors hover:text-white">or tap to open</button>
            )}
          </motion.div>
        )}

        {stage === "options" && (
          <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-7">
            <div className="text-center space-y-1">
              <p className="text-[10px] tracking-[0.22em] uppercase font-medium font-mono text-[#dcff73]">[ three escapes made it into your bag ]</p>
              <p className="text-sm text-[#a1a1aa]">{window.label} · pick one</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {recommendations.map((recommendation, index) => (
                <TripOptionCard
                  key={recommendation.destination.id}
                  recommendation={recommendation}
                  preferences={preferences}
                  index={index}
                  onPick={() => onPick(recommendation)}
                />
              ))}
            </div>
            <div className="text-center">
              <button onClick={onAdjust} className="text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors">← none of these — adjust my blanks</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
