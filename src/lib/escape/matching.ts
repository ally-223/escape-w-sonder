import { SEED_PROFILES } from "./mockProfiles";
import {
  calculatePersonalityType,
  getPersonalityCompatibility,
  PERSONALITY_TYPES,
} from "./personalities";
import type { CompatibleProfile, GroupPersonality, SurveyAnswers } from "./types";

export function matchCompatiblePeople(
  answers: SurveyAnswers,
  preferredGroupPersonality: GroupPersonality,
): CompatibleProfile[] {
  const userPersonality = calculatePersonalityType(answers);

  return SEED_PROFILES.map((profile) => {
    const personality = PERSONALITY_TYPES[profile.personalityId];
    const compatibility = getPersonalityCompatibility(userPersonality.id, profile.personalityId);
    const preferenceMatch = profile.groupPersonalityTags.includes(preferredGroupPersonality);
    return {
      profile: {
        id: profile.id,
        firstName: profile.firstName,
        avatar: profile.avatar,
        bio: profile.bio,
        personalityId: profile.personalityId,
        personalityName: personality.name,
        strengths: personality.strengths,
        compatibility,
        groupPersonalityTags: profile.groupPersonalityTags,
        reasons: [
          `${personality.name} energy complements your ${userPersonality.name} style`,
          preferenceMatch
            ? `Brings the ${preferredGroupPersonality} group energy you asked for`
            : `Adds ${profile.groupPersonalityTags[0]} energy to the group`,
        ] as [string, string],
      },
      rankScore: compatibility + (preferenceMatch ? 8 : 0),
    };
  })
    .sort((first, second) => second.rankScore - first.rankScore || first.profile.id.localeCompare(second.profile.id))
    .map(({ profile }) => profile);
}
