import type {
  ConversationStyle,
  GroupRole,
  SocialRhythm,
  SurveyAnswers,
} from "./types";

type SurveyKey = keyof SurveyAnswers;

export type SurveyQuestionDef =
  | {
      key: "socialInitiation" | "decisionMaking" | "openness";
      type: "slider";
      section: string;
      prompt: string;
      lowLabel: string;
      middleLabel: string;
      highLabel: string;
      defaultValue: 50;
    }
  | {
      key: "groupRole";
      type: "single";
      section: string;
      prompt: string;
      options: { value: GroupRole; label: string }[];
    }
  | {
      key: "conversationStyles";
      type: "multi";
      section: string;
      prompt: string;
      maxSelections: 3;
      options: { value: ConversationStyle; label: string }[];
    }
  | {
      key: "socialRhythm";
      type: "single";
      section: string;
      prompt: string;
      options: { value: SocialRhythm; label: string }[];
    };

export const SURVEY_QUESTIONS: SurveyQuestionDef[] = [
  {
    key: "socialInitiation",
    type: "slider",
    section: "your social energy",
    prompt: "When you’re with people you don’t know, what are you usually like?",
    lowLabel: "I wait for someone else to start the conversation",
    middleLabel: "I join in once the conversation gets going",
    highLabel: "I naturally introduce myself and bring people together",
    defaultValue: 50,
  },
  {
    key: "groupRole",
    type: "single",
    section: "your group style",
    prompt: "What role do you naturally take in a group?",
    options: [
      { value: "organizer", label: "The organizer — I keep everyone moving and make decisions" },
      { value: "connector", label: "The connector — I make sure everyone feels included" },
      { value: "energy", label: "The energy — I bring excitement and suggest spontaneous ideas" },
      { value: "observer", label: "The observer — I listen, notice things, and open up gradually" },
      { value: "flexible", label: "The flexible one — I’m happy to follow whatever the group decides" },
    ],
  },
  {
    key: "conversationStyles",
    type: "multi",
    section: "how you connect",
    prompt: "What kinds of conversations help you connect with someone?",
    maxSelections: 3,
    options: [
      { value: "playful", label: "Playful banter" },
      { value: "deep", label: "Deep personal conversations" },
      { value: "ideas", label: "Ideas, technology, or current events" },
      { value: "stories", label: "Stories and life experiences" },
      { value: "interests", label: "Shared interests and hobbies" },
      { value: "quiet", label: "Quiet companionship" },
      { value: "debates", label: "Friendly debates" },
      { value: "variety", label: "Meeting lots of different people" },
    ],
  },
  {
    key: "decisionMaking",
    type: "slider",
    section: "your group style",
    prompt: "When the group cannot decide what to do, what are you most likely to do?",
    lowLabel: "Let someone else choose",
    middleLabel: "Discuss the options and find a compromise",
    highLabel: "Make a decision so the group can move forward",
    defaultValue: 50,
  },
  {
    key: "socialRhythm",
    type: "single",
    section: "your social rhythm",
    prompt: "What usually makes group time feel best to you?",
    options: [
      { value: "together", label: "Staying together for most of the experience" },
      { value: "balanced", label: "Spending time together with occasional breaks" },
      { value: "smallGroups", label: "Breaking into smaller groups throughout the day" },
      { value: "independent", label: "Having lots of independence and meeting up for key activities" },
    ],
  },
  {
    key: "openness",
    type: "slider",
    section: "your openness",
    prompt: "How easily do you connect with people who are different from you?",
    lowLabel: "I connect best with people who feel familiar",
    middleLabel: "I like a mix of similarities and differences",
    highLabel: "I love meeting people with completely different backgrounds and perspectives",
    defaultValue: 50,
  },
];

export type { SurveyKey };
