"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const MESSAGES = [
  "Reading your travel personality…",
  "Finding people who match your energy…",
  "Comparing stays within your budget…",
  "Calculating the ideal chaos-to-comfort ratio…",
  "Building your mystery escape…",
];

const STEP_DURATION_MS = 650;

interface LoadingSequenceProps {
  onComplete: () => void;
}

export default function LoadingSequence({ onComplete }: LoadingSequenceProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= MESSAGES.length - 1) {
      const timeout = setTimeout(onComplete, STEP_DURATION_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStep((s) => s + 1), STEP_DURATION_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 relative"
      >
        <Image src="/surveyblob2.png" alt="" fill className="object-contain" />
      </motion.div>

      <div className="h-6 relative w-72">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 text-sm text-[#a1a1aa]"
          >
            {MESSAGES[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex gap-1.5">
        {MESSAGES.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
            style={{ background: i <= step ? "#dcff73" : "#27272a" }}
          />
        ))}
      </div>
    </div>
  );
}
