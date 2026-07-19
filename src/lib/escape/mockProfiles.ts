import type { GroupPersonality, PersonalityTypeId } from "./types";

export interface SeedProfile {
  id: string;
  firstName: string;
  avatar: string;
  bio: string;
  personalityId: PersonalityTypeId;
  groupPersonalityTags: GroupPersonality[];
}

/** Five fabricated demo personas. They are not real Sonder users. */
export const SEED_PROFILES: SeedProfile[] = [
  {
    id: "seed-1",
    firstName: "Maya",
    avatar: "/pfp1.png",
    bio: "Third-year comm student. Will talk your ear off about the café we’re going to.",
    personalityId: "warmConnector",
    groupPersonalityTags: ["social", "curious", "easygoing"],
  },
  {
    id: "seed-2",
    firstName: "Theo",
    avatar: "/pfp2.png",
    bio: "Needs a weekend that doesn’t start before 10am. Non-negotiable.",
    personalityId: "thoughtfulObserver",
    groupPersonalityTags: ["thoughtful", "easygoing", "curious"],
  },
  {
    id: "seed-3",
    firstName: "Priya",
    avatar: "/pfp3.png",
    bio: "Will organize the group chat, the itinerary, and probably your life.",
    personalityId: "steadyPlanner",
    groupPersonalityTags: ["thoughtful", "curious", "adventurous"],
  },
  {
    id: "seed-4",
    firstName: "Jordan",
    avatar: "/pfp4.png",
    bio: "Down for whatever, as long as there’s a good playlist involved.",
    personalityId: "spontaneousExplorer",
    groupPersonalityTags: ["adventurous", "playful", "social"],
  },
  {
    id: "seed-5",
    firstName: "Aliyah",
    avatar: "/pfp5.png",
    bio: "Museum person. Will find the one good bookstore in any city.",
    personalityId: "deepConversationalist",
    groupPersonalityTags: ["thoughtful", "curious", "easygoing"],
  },
];
