import type { DimensionKey } from "./types";

export type QuestionType = "slider" | "binary" | "cards";

export interface SurveyQuestionDef {
  key: DimensionKey;
  type: QuestionType;
  /** Short section title shown in the survey header, Sonder-style. */
  section: string;
  prompt: string;
  lowLabel: string;
  highLabel: string;
  /** Only used by "cards" — a short line under each card. */
  lowHint?: string;
  highHint?: string;
}

/** The 10 fixed dimensions, in display order. Sliders/binary/cards map
 * straight to a 0-100 value on submit (binary = 0 or 100, cards = 0 or 100,
 * slider = whatever the user leaves it at). */
export const SURVEY_QUESTIONS: SurveyQuestionDef[] = [
  {
    key: "introversion",
    section: "your energy",
    type: "cards",
    prompt: "After a long week, you'd rather",
    lowLabel: "Stay in with one or two people",
    highLabel: "Be out where the energy is",
    lowHint: "Recharge quietly",
    highHint: "Recharge socially",
  },
  {
    key: "planning",
    section: "your energy",
    type: "binary",
    prompt: "Your ideal weekend has",
    lowLabel: "A plan for every hour",
    highLabel: "No plan at all",
  },
  {
    key: "pace",
    section: "your energy",
    type: "slider",
    prompt: "How full do you like your days?",
    lowLabel: "Wide open",
    highLabel: "Packed to the minute",
  },
  {
    key: "novelty",
    section: "your style",
    type: "cards",
    prompt: "Given the choice, you'd pick",
    lowLabel: "Your tried-and-true favourite",
    highLabel: "Something you've never done",
    lowHint: "Familiar and reliable",
    highHint: "New and unknown",
  },
  {
    key: "groupSize",
    section: "your style",
    type: "slider",
    prompt: "Your ideal group size for this trip",
    lowLabel: "Just a couple people",
    highLabel: "The more the merrier",
  },
  {
    key: "nightlife",
    section: "your style",
    type: "binary",
    prompt: "By 10pm, you're usually",
    lowLabel: "Winding down",
    highLabel: "Just getting started",
  },
  {
    key: "setting",
    section: "your trip",
    type: "cards",
    prompt: "Pick your backdrop",
    lowLabel: "Trees, water, quiet",
    highLabel: "Skyline, streets, noise",
    lowHint: "Nature",
    highHint: "City",
  },
  {
    key: "spend",
    section: "your trip",
    type: "slider",
    prompt: "How you feel about spending on this trip",
    lowLabel: "Keep it budget-friendly",
    highLabel: "Worth splurging on",
  },
  {
    key: "togetherness",
    section: "your trip",
    type: "binary",
    prompt: "During the trip, you want",
    lowLabel: "Time to do your own thing",
    highLabel: "To do everything as a group",
  },
  {
    key: "adventure",
    section: "your trip",
    type: "slider",
    prompt: "Comfort or adventure?",
    lowLabel: "Comfort-focused",
    highLabel: "Adventure-focused",
  },
];
