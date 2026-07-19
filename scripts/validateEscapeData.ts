/**
 * Data + recommendation validation for the Sonder Escape catalog.
 * Run:  npx tsx scripts/validateEscapeData.ts
 *
 * Part 1 — structural checks over the 10-destination catalog.
 * Part 2 — 11 recommendation scenarios with full reports.
 */
import { CATALOG } from "../src/lib/escape/data/catalog";
import { BOOKING_LINK_PLACEHOLDER } from "../src/lib/escape/data/schema";
import { TRIP_ORIGIN } from "../src/lib/escape/data/origin";
import { recommend, type RecommendInput } from "../src/lib/escape/recommend";

let failures = 0;
function check(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.log(`  ✗ FAIL: ${label}`);
  }
}

console.log("=== PART 1: STRUCTURAL DATA VALIDATION ===\n");
console.log(`Origin: ${TRIP_ORIGIN.name} (${TRIP_ORIGIN.lat}, ${TRIP_ORIGIN.lng})\n`);

check(CATALOG.length === 10, `exactly 10 destinations (found ${CATALOG.length})`);

const ids = CATALOG.map((d) => d.id);
check(new Set(ids).size === ids.length, "destination IDs are unique");

const legacyIds = ["toronto", "niagara-falls", "montreal"];
check(
  legacyIds.every((id) => ids.includes(id as (typeof ids)[number])),
  "legacy IDs (toronto, niagara-falls, montreal) preserved verbatim",
);

const allHotelIds: string[] = [];
const allPlanIds: string[] = [];

for (const d of CATALOG) {
  console.log(`\n— ${d.name} (${d.id})`);
  check(d.hotels.length === 3, "exactly 3 hotels");
  check(d.plans.length === 3, "exactly 3 trip plans");
  check(
    JSON.stringify(d.hotels.map((h) => h.tier)) === JSON.stringify(["affordable", "balanced", "memorable"]),
    "hotel tiers are [affordable, balanced, memorable]",
  );
  check(
    JSON.stringify(d.plans.map((p) => p.category)) ===
      JSON.stringify(["culture-food", "nature-wellness", "social-nightlife"]),
    "plan categories are [culture-food, nature-wellness, social-nightlife]",
  );
  check(d.weekendBudgetMinPerPerson < d.weekendBudgetMaxPerPerson, "budget min < max");
  check(d.requiresBorderCrossing === false, "correctly marked domestic (no border crossing)");
  check(d.oneWayTravelHours >= 0 && d.distanceKm >= 0, "distance/time relative to origin are non-negative");
  check(d.transportOptions.length > 0, "has at least one transport option");
  check(
    d.transportOptions.some((t) => t.roundTripCostPerPerson === d.estTransportCostPerPerson),
    "estTransportCostPerPerson matches one of the transport options",
  );

  // hotel checks
  const [aff, bal, mem] = d.hotels;
  check(aff.nightlyPrice <= bal.nightlyPrice && bal.nightlyPrice <= mem.nightlyPrice, "hotel prices ascend by tier");
  for (const h of d.hotels) {
    allHotelIds.push(h.id);
    check(h.isMockData === true, `${h.id}: isMockData flag set`);
    check(h.bookingUrl === BOOKING_LINK_PLACEHOLDER, `${h.id}: booking link is the placeholder`);
    check(h.typicalStayPrice === h.nightlyPrice * 2, `${h.id}: typicalStayPrice = nightly x 2`);
    check(
      Math.abs(h.typicalCostPerPerson - h.typicalStayPrice / h.assumedGuests) < 1,
      `${h.id}: per-person math consistent`,
    );
    check(h.amenities.length > 0 && h.stay22Query.length > 0, `${h.id}: amenities + Stay22 query present`);
  }

  // budget consistency: cheapest realistic trip fits min; priciest fits max
  const cheapestPlan = [...d.plans].sort((a, b) => a.totalNonHotelCostPerPerson - b.totalNonHotelCostPerPerson)[0];
  const priciestPlan = [...d.plans].sort((a, b) => b.totalNonHotelCostPerPerson - a.totalNonHotelCostPerPerson)[0];
  const cheapestTrip =
    (aff.nightlyPrice * 2) / aff.assumedGuests + d.estTransportCostPerPerson + cheapestPlan.totalNonHotelCostPerPerson;
  const priciestTrip =
    (mem.nightlyPrice * 2) / mem.assumedGuests + d.estTransportCostPerPerson + priciestPlan.totalNonHotelCostPerPerson;
  check(
    d.weekendBudgetMinPerPerson <= cheapestTrip + 25,
    `budget min ($${d.weekendBudgetMinPerPerson}) consistent with cheapest real trip (~$${Math.round(cheapestTrip)})`,
  );
  check(
    d.weekendBudgetMaxPerPerson >= priciestTrip - 25,
    `budget max ($${d.weekendBudgetMaxPerPerson}) covers priciest real trip (~$${Math.round(priciestTrip)})`,
  );

  // plan checks
  for (const p of d.plans) {
    allPlanIds.push(p.id);
    const activityCount = p.days.reduce((n, day) => n + day.activities.length, 0);
    check(activityCount >= 4, `${p.id}: has ${activityCount} activities (min 4)`);
    check(p.backupActivity.length > 0, `${p.id}: backup activity present`);
    check(
      p.totalNonHotelCostPerPerson === p.activityCostPerPerson + p.mealCostPerPerson,
      `${p.id}: non-hotel total = activities + meals`,
    );
    check(p.days.length >= 2, `${p.id}: at least 2 days planned`);
  }
  if (d.oneWayTravelHours >= 4) {
    check(
      d.plans.every((p) => p.days.length === 3),
      "long-travel destination plans include a day 3",
    );
  }
}

check(new Set(allHotelIds).size === allHotelIds.length, "\nall 30 hotel IDs unique");
check(new Set(allPlanIds).size === allPlanIds.length, "all 30 plan IDs unique");

console.log("\n\n=== PART 2: RECOMMENDATION SCENARIOS ===");

const friday6pm = "2026-07-24T18:00:00";
const sunday6pm = "2026-07-26T18:00:00";
const saturday9am = "2026-07-25T09:00:00";
const mondayHoliday6pm = "2026-08-03T18:00:00";

const scenarios: { name: string; input: RecommendInput }[] = [
  {
    name: "1. Low-budget Toronto staycation",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 160,
      maxTravelHours: 1, cravings: ["food-cafes", "art-culture"],
      accommodationStyle: "simple and affordable", itineraryStructure: "loosely planned",
      archetypeId: "culture-collector",
    },
  },
  {
    name: "2. One-night nearby escape",
    input: {
      startDateTime: saturday9am, endDateTime: sunday6pm, budgetPerPerson: 250,
      maxTravelHours: 2, cravings: ["nature-outdoors"],
      accommodationStyle: "simple and affordable", itineraryStructure: "loosely planned",
      archetypeId: "intentional-adventurer",
    },
  },
  {
    name: "3. Food & culture weekend",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 400,
      maxTravelHours: 3, cravings: ["food-cafes", "art-culture", "hidden-gems"],
      accommodationStyle: "cozy and social", itineraryStructure: "a balanced schedule",
      archetypeId: "culture-collector",
    },
  },
  {
    name: "4. Nature & relaxation weekend",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 450,
      maxTravelHours: 3, cravings: ["nature-outdoors", "wellness-relaxation"],
      accommodationStyle: "private and comfortable", itineraryStructure: "loosely planned",
      archetypeId: "cozy-wanderer",
    },
  },
  {
    name: "5. Nightlife & social weekend",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 350,
      maxTravelHours: 3, cravings: ["nightlife", "games-play"],
      accommodationStyle: "cozy and social", itineraryStructure: "completely spontaneous",
      archetypeId: "social-explorer",
    },
  },
  {
    name: "6. Luxury accommodation preference",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 800,
      maxTravelHours: 3, cravings: ["wellness-relaxation", "food-cafes"],
      accommodationStyle: "stylish and luxurious", itineraryStructure: "carefully planned",
      archetypeId: "cozy-wanderer",
    },
  },
  {
    name: "7. Very short availability window (Sat morning → Sun evening)",
    input: {
      startDateTime: saturday9am, endDateTime: "2026-07-26T20:00:00", budgetPerPerson: 300,
      maxTravelHours: 5, cravings: ["food-cafes", "nightlife"],
      accommodationStyle: "cozy and social", itineraryStructure: "completely spontaneous",
      archetypeId: "chaos-tourist",
    },
  },
  {
    name: "8. Three-day long weekend, big budget",
    input: {
      startDateTime: "2026-07-31T15:00:00", endDateTime: mondayHoliday6pm, budgetPerPerson: 700,
      maxTravelHours: 8, cravings: ["art-culture", "food-cafes", "hidden-gems"],
      accommodationStyle: "unique and memorable", itineraryStructure: "a balanced schedule",
      archetypeId: "culture-collector",
    },
  },
  {
    name: "9. International travel allowed (border OK)",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 500,
      maxTravelHours: 3, cravings: ["nature-outdoors", "games-play"],
      accommodationStyle: "private and comfortable", itineraryStructure: "a balanced schedule",
      archetypeId: "intentional-adventurer", allowBorderCrossing: true,
    },
  },
  {
    name: "10. International travel NOT allowed",
    input: {
      startDateTime: friday6pm, endDateTime: sunday6pm, budgetPerPerson: 500,
      maxTravelHours: 3, cravings: ["nature-outdoors", "games-play"],
      accommodationStyle: "private and comfortable", itineraryStructure: "a balanced schedule",
      archetypeId: "intentional-adventurer", allowBorderCrossing: false,
    },
  },
  {
    name: "11. No result meets all hard constraints ($100, 1h max, 1 night)",
    input: {
      startDateTime: saturday9am, endDateTime: sunday6pm, budgetPerPerson: 100,
      maxTravelHours: 1, cravings: ["wellness-relaxation"],
      accommodationStyle: "stylish and luxurious", itineraryStructure: "carefully planned",
      archetypeId: "cozy-wanderer",
    },
  },
];

for (const { name, input } of scenarios) {
  const result = recommend(input);
  console.log(`\n\n### ${name}`);
  console.log(
    `Input: $${input.budgetPerPerson}/pp · max ${input.maxTravelHours}h · ${result.input.tripNights} night(s) · cravings [${input.cravings.join(", ")}] · ${input.accommodationStyle} · ${input.itineraryStructure} · ${input.archetypeId}${input.allowBorderCrossing === false ? " · NO border crossing" : ""}`,
  );
  if (result.exclusions.length > 0) {
    console.log("Excluded:");
    for (const e of result.exclusions) console.log(`  - ${e.destinationId}: ${e.reason}`);
  }
  if (result.recommendations.length === 0) {
    console.log("→ NO recommendations (graceful empty result)");
    continue;
  }
  console.log(`Top ${result.recommendations.length}:`);
  result.recommendations.forEach((r, i) => {
    console.log(
      `  ${i + 1}. ${r.destination.name}${r.relaxedConstraint ? ` [relaxed: ${r.relaxedConstraint}]` : ""} — score ${r.score.total}`,
    );
    console.log(`     hotel: ${r.hotel.name} (${r.hotel.tier}, $${r.hotel.nightlyPrice}/nt)`);
    console.log(`     plan:  ${r.plan.title} (${r.plan.category})`);
    console.log(
      `     cost/pp: $${r.cost.total} (hotel $${r.cost.accommodation} + transport $${r.cost.transport} + food $${r.cost.food} + activities $${r.cost.activities})`,
    );
    console.log(
      `     breakdown: craving ${r.score.craving} · accom ${r.score.accommodation} · structure ${r.score.structure} · archetype ${r.score.archetype} · budget ${r.score.budgetFit} · travel ${r.score.travelEase}`,
    );
    for (const reason of r.reasons) console.log(`     • ${reason}`);
  });
}

console.log(`\n\n=== RESULT: ${failures === 0 ? "ALL STRUCTURAL CHECKS PASSED" : `${failures} FAILURES`} ===`);
process.exit(failures === 0 ? 0 : 1);
