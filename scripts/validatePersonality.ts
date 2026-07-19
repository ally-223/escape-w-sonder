import assert from "node:assert/strict";
import {
  calculatePersonalityType,
  getPersonalityCompatibility,
  PERSONALITY_ORDER,
} from "../src/lib/escape/personalities";
import { SURVEY_QUESTIONS } from "../src/lib/escape/surveyQuestions";
import type {
  ConversationStyle,
  GroupRole,
  PersonalityTypeId,
  SocialRhythm,
  SurveyAnswers,
} from "../src/lib/escape/types";

assert.equal(SURVEY_QUESTIONS.length, 6, "survey has exactly six questions");
for (const question of SURVEY_QUESTIONS) {
  if (question.type === "slider") assert.equal(question.defaultValue, 50, `${question.key} defaults to 50`);
  if (question.type === "multi") assert.equal(question.maxSelections, 3, "conversation styles cap at three");
}

const requiredExamples: [PersonalityTypeId, PersonalityTypeId, number][] = [
  ["socialCatalyst", "thoughtfulObserver", 88],
  ["socialCatalyst", "warmConnector", 85],
  ["steadyPlanner", "easygoingCompanion", 90],
  ["spontaneousExplorer", "independentWanderer", 86],
  ["deepConversationalist", "thoughtfulObserver", 92],
  ["socialCatalyst", "socialCatalyst", 65],
  ["steadyPlanner", "steadyPlanner", 55],
];

for (const first of PERSONALITY_ORDER) {
  for (const second of PERSONALITY_ORDER) {
    const score = getPersonalityCompatibility(first, second);
    assert.ok(Number.isInteger(score) && score >= 0 && score <= 100, `${first}/${second} is a 0-100 integer`);
    assert.equal(score, getPersonalityCompatibility(second, first), `${first}/${second} is symmetric`);
  }
}
for (const [first, second, expected] of requiredExamples) {
  assert.equal(getPersonalityCompatibility(first, second), expected, `${first}/${second} keeps required score`);
}

const roles: GroupRole[] = ["organizer", "connector", "energy", "observer", "flexible"];
const rhythms: SocialRhythm[] = ["together", "balanced", "smallGroups", "independent"];
const styles: ConversationStyle[][] = [
  ["playful", "variety"],
  ["stories", "interests"],
  ["quiet", "deep"],
  ["deep", "ideas", "debates"],
  ["interests", "quiet"],
];
const reached = new Set<PersonalityTypeId>();
for (const socialInitiation of [10, 50, 90]) {
  for (const decisionMaking of [10, 50, 90]) {
    for (const openness of [10, 50, 90]) {
      for (const groupRole of roles) {
        for (const socialRhythm of rhythms) {
          for (const conversationStyles of styles) {
            const answers: SurveyAnswers = { socialInitiation, groupRole, conversationStyles, decisionMaking, socialRhythm, openness };
            const first = calculatePersonalityType(answers);
            const second = calculatePersonalityType(answers);
            assert.equal(first.id, second.id, "scoring is deterministic");
            reached.add(first.id);
          }
        }
      }
    }
  }
}
assert.deepEqual([...reached].sort(), [...PERSONALITY_ORDER].sort(), "all eight personality types are reachable");
assert.equal(getPersonalityCompatibility("unknown", "socialCatalyst"), 0, "unknown IDs fail safely");

console.log("Personality validation passed: six questions, eight reachable types, deterministic scoring, complete symmetric matrix.");
