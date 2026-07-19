/**
 * Fixed origin for every travel estimate in the destination catalog.
 * All distances, travel times, and transportation costs are calculated
 * relative to this point — NOT Waterloo.
 */
export const TRIP_ORIGIN = {
  name: "University of Toronto — St. George campus",
  address: "27 King's College Circle, Toronto, ON, Canada",
  city: "Toronto",
  province: "Ontario",
  country: "Canada",
  lat: 43.6629,
  lng: -79.3957,
} as const;

export type TripOrigin = typeof TRIP_ORIGIN;
