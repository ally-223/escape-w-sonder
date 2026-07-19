import type {
  ArchetypeId,
  PersonalityType,
  PersonalityTypeId,
  SurveyAnswers,
} from "./types";

export const PERSONALITY_ORDER: PersonalityTypeId[] = [
  "socialCatalyst",
  "warmConnector",
  "spontaneousExplorer",
  "thoughtfulObserver",
  "steadyPlanner",
  "easygoingCompanion",
  "deepConversationalist",
  "independentWanderer",
];

export const PERSONALITY_TYPES: Record<PersonalityTypeId, PersonalityType> = {
  socialCatalyst: {
    id: "socialCatalyst",
    name: "Social Catalyst",
    shortDescription: "Outgoing, decisive, energetic, and comfortable initiating interactions.",
    strengths: ["Starts conversations", "Builds group energy", "Moves plans forward"],
  },
  warmConnector: {
    id: "warmConnector",
    name: "Warm Connector",
    shortDescription: "Inclusive, socially aware, and focused on making everyone feel comfortable.",
    strengths: ["Includes everyone", "Reads the room", "Creates trust"],
  },
  spontaneousExplorer: {
    id: "spontaneousExplorer",
    name: "Spontaneous Explorer",
    shortDescription: "Open-minded, energetic, flexible, and excited by unfamiliar experiences.",
    strengths: ["Tries new things", "Adapts quickly", "Brings adventurous energy"],
  },
  thoughtfulObserver: {
    id: "thoughtfulObserver",
    name: "Thoughtful Observer",
    shortDescription: "Quiet at first, reflective, attentive, and more comfortable opening up gradually.",
    strengths: ["Listens closely", "Notices details", "Builds meaningful connections"],
  },
  steadyPlanner: {
    id: "steadyPlanner",
    name: "Steady Planner",
    shortDescription: "Organized, dependable, decisive, and comfortable giving the group structure.",
    strengths: ["Keeps plans organized", "Makes clear decisions", "Follows through"],
  },
  easygoingCompanion: {
    id: "easygoingCompanion",
    name: "Easygoing Companion",
    shortDescription: "Flexible, relaxed, cooperative, and happy to follow the group’s direction.",
    strengths: ["Goes with the flow", "Keeps things relaxed", "Supports the group"],
  },
  deepConversationalist: {
    id: "deepConversationalist",
    name: "Deep Conversationalist",
    shortDescription: "Reflective and most engaged by personal stories, ideas, and meaningful conversation.",
    strengths: ["Asks thoughtful questions", "Shares meaningful ideas", "Connects through stories"],
  },
  independentWanderer: {
    id: "independentWanderer",
    name: "Independent Wanderer",
    shortDescription: "Open to new people but prefers autonomy, personal space, and flexible group movement.",
    strengths: ["Explores independently", "Respects personal space", "Brings fresh discoveries back"],
  },
};

type Scores = Record<PersonalityTypeId, number>;

function add(scores: Scores, id: PersonalityTypeId, points: number) {
  scores[id] += points;
}

export function calculatePersonalityType(answers: SurveyAnswers): PersonalityType {
  const scores = Object.fromEntries(PERSONALITY_ORDER.map((id) => [id, 0])) as Scores;

  if (answers.socialInitiation <= 33) {
    add(scores, "thoughtfulObserver", 3);
    add(scores, "easygoingCompanion", 2);
    add(scores, "deepConversationalist", 1);
  } else if (answers.socialInitiation <= 66) {
    add(scores, "warmConnector", 2);
    add(scores, "deepConversationalist", 2);
    add(scores, "easygoingCompanion", 1);
  } else {
    add(scores, "socialCatalyst", 3);
    add(scores, "spontaneousExplorer", 2);
    add(scores, "steadyPlanner", 1);
  }

  switch (answers.groupRole) {
    case "organizer": add(scores, "steadyPlanner", 4); add(scores, "socialCatalyst", 2); break;
    case "connector": add(scores, "warmConnector", 4); add(scores, "deepConversationalist", 1); break;
    case "energy": add(scores, "spontaneousExplorer", 4); add(scores, "socialCatalyst", 2); break;
    case "observer": add(scores, "thoughtfulObserver", 4); add(scores, "deepConversationalist", 2); break;
    case "flexible": add(scores, "easygoingCompanion", 4); add(scores, "independentWanderer", 1); break;
  }

  for (const style of answers.conversationStyles ?? []) {
    switch (style) {
      case "playful": add(scores, "socialCatalyst", 2); add(scores, "spontaneousExplorer", 2); break;
      case "deep": add(scores, "deepConversationalist", 3); add(scores, "thoughtfulObserver", 1); break;
      case "ideas": add(scores, "deepConversationalist", 2); add(scores, "independentWanderer", 1); break;
      case "stories": add(scores, "warmConnector", 2); add(scores, "deepConversationalist", 2); break;
      case "interests": add(scores, "easygoingCompanion", 2); add(scores, "warmConnector", 1); break;
      case "quiet": add(scores, "thoughtfulObserver", 3); add(scores, "easygoingCompanion", 1); break;
      case "debates": add(scores, "socialCatalyst", 1); add(scores, "deepConversationalist", 2); break;
      case "variety": add(scores, "spontaneousExplorer", 3); add(scores, "socialCatalyst", 1); break;
    }
  }

  if (answers.decisionMaking <= 33) {
    add(scores, "easygoingCompanion", 3);
    add(scores, "thoughtfulObserver", 1);
  } else if (answers.decisionMaking <= 66) {
    add(scores, "warmConnector", 2);
    add(scores, "deepConversationalist", 1);
  } else {
    add(scores, "steadyPlanner", 3);
    add(scores, "socialCatalyst", 2);
  }

  switch (answers.socialRhythm) {
    case "together": add(scores, "warmConnector", 3); add(scores, "socialCatalyst", 1); break;
    case "balanced": add(scores, "easygoingCompanion", 2); add(scores, "deepConversationalist", 1); break;
    case "smallGroups": add(scores, "thoughtfulObserver", 2); add(scores, "deepConversationalist", 2); break;
    case "independent": add(scores, "independentWanderer", 4); add(scores, "spontaneousExplorer", 1); break;
  }

  if (answers.openness <= 33) {
    add(scores, "thoughtfulObserver", 2);
    add(scores, "steadyPlanner", 1);
  } else if (answers.openness <= 66) {
    add(scores, "easygoingCompanion", 2);
    add(scores, "warmConnector", 1);
  } else {
    add(scores, "spontaneousExplorer", 3);
    add(scores, "independentWanderer", 2);
    add(scores, "socialCatalyst", 1);
  }

  let winner = PERSONALITY_ORDER[0];
  for (const id of PERSONALITY_ORDER.slice(1)) {
    if (scores[id] > scores[winner]) winner = id;
  }
  return PERSONALITY_TYPES[winner];
}

const compatibilityRows: Record<PersonalityTypeId, Record<PersonalityTypeId, number>> = {
  socialCatalyst: { socialCatalyst: 65, warmConnector: 85, spontaneousExplorer: 84, thoughtfulObserver: 88, steadyPlanner: 78, easygoingCompanion: 72, deepConversationalist: 68, independentWanderer: 60 },
  warmConnector: { socialCatalyst: 85, warmConnector: 78, spontaneousExplorer: 82, thoughtfulObserver: 87, steadyPlanner: 80, easygoingCompanion: 88, deepConversationalist: 90, independentWanderer: 74 },
  spontaneousExplorer: { socialCatalyst: 84, warmConnector: 82, spontaneousExplorer: 72, thoughtfulObserver: 76, steadyPlanner: 58, easygoingCompanion: 84, deepConversationalist: 75, independentWanderer: 86 },
  thoughtfulObserver: { socialCatalyst: 88, warmConnector: 87, spontaneousExplorer: 76, thoughtfulObserver: 75, steadyPlanner: 82, easygoingCompanion: 86, deepConversationalist: 92, independentWanderer: 84 },
  steadyPlanner: { socialCatalyst: 78, warmConnector: 80, spontaneousExplorer: 58, thoughtfulObserver: 82, steadyPlanner: 55, easygoingCompanion: 90, deepConversationalist: 70, independentWanderer: 60 },
  easygoingCompanion: { socialCatalyst: 72, warmConnector: 88, spontaneousExplorer: 84, thoughtfulObserver: 86, steadyPlanner: 90, easygoingCompanion: 80, deepConversationalist: 76, independentWanderer: 82 },
  deepConversationalist: { socialCatalyst: 68, warmConnector: 90, spontaneousExplorer: 75, thoughtfulObserver: 92, steadyPlanner: 70, easygoingCompanion: 76, deepConversationalist: 78, independentWanderer: 80 },
  independentWanderer: { socialCatalyst: 60, warmConnector: 74, spontaneousExplorer: 86, thoughtfulObserver: 84, steadyPlanner: 60, easygoingCompanion: 82, deepConversationalist: 80, independentWanderer: 70 },
};

export function getPersonalityCompatibility(firstPersonalityId: string, secondPersonalityId: string): number {
  const first = compatibilityRows[firstPersonalityId as PersonalityTypeId];
  const value = first?.[secondPersonalityId as PersonalityTypeId];
  return Number.isInteger(value) ? value : 0;
}

export const PERSONALITY_TO_ARCHETYPE: Record<PersonalityTypeId, ArchetypeId> = {
  socialCatalyst: "social-explorer",
  warmConnector: "curious-connector",
  spontaneousExplorer: "chaos-tourist",
  thoughtfulObserver: "cozy-wanderer",
  steadyPlanner: "intentional-adventurer",
  easygoingCompanion: "cozy-wanderer",
  deepConversationalist: "culture-collector",
  independentWanderer: "culture-collector",
};

export function personalityToArchetype(personalityId: PersonalityTypeId): ArchetypeId {
  return PERSONALITY_TO_ARCHETYPE[personalityId];
}
