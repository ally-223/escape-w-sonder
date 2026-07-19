import type { CatalogDestinationId, DestinationRecord } from "./schema";
import { toronto } from "./destinations/toronto";
import { niagaraFalls } from "./destinations/niagaraFalls";
import { niagaraOnTheLake } from "./destinations/niagaraOnTheLake";
import { hamilton } from "./destinations/hamilton";
import { blueMountain } from "./destinations/blueMountain";
import { princeEdwardCounty } from "./destinations/princeEdwardCounty";
import { kingston } from "./destinations/kingston";
import { ottawa } from "./destinations/ottawa";
import { montreal } from "./destinations/montreal";
import { quebecCity } from "./destinations/quebecCity";

/** The full 10-destination catalog, ordered roughly by distance from
 * the U of T St. George origin (see ./origin.ts). */
export const CATALOG: DestinationRecord[] = [
  toronto,
  hamilton,
  niagaraFalls,
  niagaraOnTheLake,
  blueMountain,
  princeEdwardCounty,
  kingston,
  ottawa,
  montreal,
  quebecCity,
];

export const CATALOG_BY_ID: Record<CatalogDestinationId, DestinationRecord> =
  Object.fromEntries(CATALOG.map((d) => [d.id, d])) as Record<
    CatalogDestinationId,
    DestinationRecord
  >;
