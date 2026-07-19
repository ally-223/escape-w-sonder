import { ARCHETYPES } from "./archetypes";
import type {
  ArchetypeId,
  DestinationId,
  ItineraryActivity,
} from "./types";

type EnergyBand = "chill" | "balanced" | "high";

type ActivityBank = Record<
  DestinationId,
  Record<ItineraryActivity["slot"], Record<EnergyBand, string[]>>
>;

/**
 * Two lines per (city, slot, energy band): [title, description].
 * Mocked local dataset — not fetched from anywhere. Swap in real
 * activity data later without touching the selection logic below.
 */
const BANK: ActivityBank = {
  montreal: {
    signature: {
      chill: ["Wander the Plateau's murals", "A slow loop through Mile End and Le Plateau, stopping wherever the walls look good."],
      balanced: ["Old Montréal on foot", "Cobblestones, the port, and enough side streets to actually get a little lost."],
      high: ["Climb Mont Royal at golden hour", "Sunset from the lookout, then straight down into the Plateau for the night."],
    },
    food: {
      chill: ["Bagel run + a window seat café", "St-Viateur bagels, then a café with good light and no agenda."],
      balanced: ["Jean-Talon Market crawl", "Cheese, produce, and a dozen tiny stalls worth stopping at."],
      high: ["Late-night poutine tour", "Three spots, one dish, zero shame."],
    },
    social: {
      chill: ["Rooftop with a view, low-key", "Somewhere quiet enough to actually talk."],
      balanced: ["Live jazz at a small bar", "The kind of set that doesn't need a cover charge to be good."],
      high: ["Bar-hop down Saint-Laurent", "Start early, let the night pick the order."],
    },
  },
  toronto: {
    signature: {
      chill: ["Toronto Islands ferry", "Skip the crowds and just sit by the water for an afternoon."],
      balanced: ["Kensington Market wander", "Vintage shops, murals, and food stalls in every direction."],
      high: ["CN Tower + Distillery District", "The skyline view, then straight into the cobblestones below."],
    },
    food: {
      chill: ["Coffee crawl in West Queen West", "Two or three good roasters, no rush between them."],
      balanced: ["St. Lawrence Market lunch", "Peameal bacon sandwich, non-negotiable."],
      high: ["Late-night dumplings in Chinatown", "The kind of spot that's better at 11pm than at noon."],
    },
    social: {
      chill: ["Board game café night", "Low pressure, high snack availability."],
      balanced: ["Live music in Little Portugal", "A neighbourhood bar with an actual lineup worth staying for."],
      high: ["King West bar-hop", "The night gets louder as it goes, on purpose."],
    },
  },
  "niagara-falls": {
    signature: {
      chill: ["Falls at sunrise, no crowds", "Just the mist and the noise, before the tour buses show up."],
      balanced: ["Journey Behind the Falls", "Get right up under it — worth the raincoat."],
      high: ["Whirlpool jet boat ride", "As close to the rapids as you can get without getting in."],
    },
    food: {
      chill: ["Niagara-on-the-Lake wine tasting", "A slow afternoon among the vineyards, glass in hand."],
      balanced: ["Clifton Hill diner classics", "Loud, bright, and exactly what you want after a day outside."],
      high: ["Farm-to-table dinner in wine country", "A proper sit-down meal to close out the trip."],
    },
    social: {
      chill: ["Fireside patio, low-key", "Somewhere warm to unwind and compare photos."],
      balanced: ["Arcade night at Clifton Hill", "Cheesy, bright, and impossible not to enjoy."],
      high: ["Falls illumination + fireworks", "The nightly light show, best seen from the water's edge."],
    },
  },
};

function energyBandFor(archetypeId: ArchetypeId): EnergyBand {
  const { adventure, pace } = ARCHETYPES[archetypeId].centroid;
  const energy = (adventure + pace) / 2;
  if (energy < 40) return "chill";
  if (energy < 65) return "balanced";
  return "high";
}

export function buildItinerary(
  destinationId: DestinationId,
  archetypeId: ArchetypeId,
): ItineraryActivity[] {
  const band = energyBandFor(archetypeId);
  const bank = BANK[destinationId];

  const pick = (
    slot: ItineraryActivity["slot"],
  ): [string, string] => {
    const [title, description] = bank[slot][band];
    return [title, description];
  };

  const [signatureTitle, signatureDesc] = pick("signature");
  const [foodTitle, foodDesc] = pick("food");
  const [socialTitle, socialDesc] = pick("social");

  return [
    { slot: "signature", day: 1, title: signatureTitle, description: signatureDesc },
    { slot: "food", day: 1, title: foodTitle, description: foodDesc },
    { slot: "social", day: 2, title: socialTitle, description: socialDesc },
  ];
}
