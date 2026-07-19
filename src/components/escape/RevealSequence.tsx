"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ARCHETYPES, explainMatch } from "@/lib/escape/archetypes";
import { DESTINATIONS } from "@/lib/escape/destinations";
import type { ArchetypeId, DestinationId, SurveyAnswers } from "@/lib/escape/types";

interface RevealSequenceProps {
  archetypeId: ArchetypeId;
  destinationId: DestinationId;
  answers: SurveyAnswers;
  onComplete: () => void;
}

/** The mystery destination reveal. The archetype itself is revealed
 * earlier, at the end of the survey — this card only references it in
 * the "why this trip fits you" line. */
export default function RevealSequence({
  archetypeId,
  destinationId,
  answers,
  onComplete,
}: RevealSequenceProps) {
  const archetype = ARCHETYPES[archetypeId];
  const destination = DESTINATIONS[destinationId];
  const [reasonA, reasonB] = explainMatch(answers);

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="holo-card rounded-3xl overflow-hidden text-center"
      >
        <div className="relative w-full h-56">
          <Image src={destination.heroImage} alt={destination.name} fill className="object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 40%, #0a0a0b 100%)" }}
          />
        </div>

        <div className="p-8 pt-4 space-y-5">
          <p className="text-[10px] tracking-[0.22em] uppercase font-medium font-mono" style={{ color: "#dcff73" }}>
            [ your mystery escape is ]
          </p>
          <h1 className="text-4xl font-serif font-light text-[#f5f5f4]">{destination.name}</h1>
          <p className="text-sm text-[#a1a1aa]">{destination.description}</p>

          <div
            className="rounded-2xl p-4 text-left text-sm text-[#a1a1aa] space-y-1"
            style={{ background: "#18181b", border: "1px solid #27272a" }}
          >
            <p className="text-[#f5f5f4]">Why this trip fits you:</p>
            <p>
              <span style={{ color: "#dcff73" }}>{archetype.name}</span> energy: {reasonA} and {reasonB}. {destination.name} was the closest match.
            </p>
          </div>

          <button
            onClick={onComplete}
            className="relative z-10 w-full py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: "#dcff73", color: "#0a0a0b" }}
          >
            See my full trip
          </button>
        </div>
      </motion.div>
    </div>
  );
}
