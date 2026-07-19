import { calculatePersonalityType, personalityToArchetype } from "./personalities";
import type { ArchetypeId, SurveyAnswers } from "./types";

/**
 * Compatibility bridge for the existing destination catalog. The six legacy
 * archetype IDs are never shown to users; they remain metadata buckets only.
 */
export function scoreArchetype(answers: SurveyAnswers): ArchetypeId {
  return personalityToArchetype(calculatePersonalityType(answers).id);
}
