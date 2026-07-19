"use client";

import { motion } from "framer-motion";
import type { Recommendation } from "@/lib/escape/recommend";
import type { TripPreferences } from "@/lib/escape/types";

interface TripOptionCardProps {
  recommendation: Recommendation;
  preferences: TripPreferences;
  index: number;
  onPick: () => void;
}

export default function TripOptionCard({ recommendation, preferences, index, onPick }: TripOptionCardProps) {
  const tags = [preferences.tripVibe, preferences.pace, preferences.tripStyle].slice(0, 3);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.12 }}
      onClick={onPick}
      className="group relative min-h-[390px] w-full overflow-hidden rounded-3xl text-left transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dcff73]"
      style={{
        backgroundImage: "url('/eventcardpattern 21.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 12px 40px rgba(0,0,0,0.42), 0 4px 12px rgba(0,0,0,0.18)",
      }}
      aria-label={`Choose ${recommendation.plan.title} in ${recommendation.destination.name}`}
    >
      <span className="absolute inset-0 bg-[#ede5da]/65" />
      <span className="relative z-10 flex min-h-[390px] flex-col p-6 sm:p-7">
        <span className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.22em] text-[#8a7560]">
          <span>{index === 0 ? "best match" : "weekend escape"}</span>
          {recommendation.relaxedConstraint && (
            <span className="rounded-full border border-[#8a7560]/30 px-2 py-1 tracking-normal">
              {recommendation.relaxedConstraint === "travel-time" ? "a bit farther" : "a bit over budget"}
            </span>
          )}
        </span>

        <span className="mt-7 block font-serif text-[2rem] font-light leading-[1.05] tracking-tight text-[#1c1712]">
          {recommendation.plan.title}
        </span>

        <span className="mt-5 inline-flex items-start gap-2 text-sm leading-snug text-[#5c4a38]">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span>{recommendation.destination.name}, {recommendation.destination.region}</span>
        </span>

        <span className="mt-7 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#8a7560]/35 bg-white/20 px-2.5 py-1 text-[10px] text-[#5c4a38]">
              {tag}
            </span>
          ))}
        </span>

        <span className="mt-auto flex items-end justify-between border-t border-[#8a7560]/25 pt-6">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a7560]">estimated per person</span>
          <span className="font-serif text-3xl font-light text-[#1c1712]">${recommendation.cost.total}</span>
        </span>
        <span className="mt-5 rounded-full bg-[#5c4a38] py-2.5 text-center text-xs tracking-[0.12em] text-white transition-transform group-hover:scale-[1.02]">
          view this trip →
        </span>
      </span>
    </motion.button>
  );
}
