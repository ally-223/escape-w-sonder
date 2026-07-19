import { NextRequest, NextResponse } from "next/server";
import { CATALOG_BY_ID } from "@/lib/escape/data/catalog";
import type { CatalogDestinationId, DestinationRecord, HotelOption } from "@/lib/escape/data/schema";
import type { Accommodation } from "@/lib/escape/types";

export const dynamic = "force-dynamic";

const PROVIDER_LABELS: Record<string, string> = {
  booking: "Booking.com",
  expedia: "Expedia",
  hotelscom: "Hotels.com",
  vrbo: "Vrbo",
};

interface Stay22Supplier {
  link?: string;
  price?: { total?: number };
}

interface Stay22Result {
  id: string;
  name: string;
  /** Keyed by provider (e.g. "booking", "expedia"), not an array. */
  suppliers?: Record<string, Stay22Supplier>;
  location?: { address?: string };
  rating?: { value?: number; count?: number };
  media?: { thumbnail?: string };
}

function mapStay22Result(result: Stay22Result, nights: number): Accommodation | null {
  const entries = Object.entries(result.suppliers ?? {});
  const priced = entries.find(([, s]) => s.price?.total != null) ?? entries[0];
  if (!priced) return null;
  const [providerKey, supplier] = priced;
  if (!supplier?.price?.total) return null;

  return {
    id: result.id,
    name: result.name,
    location: result.location?.address ?? "",
    image: result.media?.thumbnail ?? "",
    ratingValue: result.rating?.value ?? 8,
    ratingCount: result.rating?.count ?? 0,
    pricePerNightTotal: Math.round(supplier.price.total / Math.max(1, nights)),
    bookingUrl: supplier.link ?? "https://www.stay22.com",
    provider: PROVIDER_LABELS[providerKey] ?? providerKey,
    source: "stay22",
  };
}

/** Catalog mock hotels mapped to the flat UI shape, requested-hotel first
 * so the fallback primary matches what the reveal promised. */
function catalogFallback(destination: DestinationRecord, chosenHotelId: string | null): Accommodation[] {
  const mapHotel = (h: HotelOption): Accommodation => ({
    id: h.id,
    name: h.name,
    location: `${h.neighborhood}, ${destination.name}`,
    image: h.image,
    ratingValue: h.guestRating,
    ratingCount: 120 + h.name.length * 7, // stable mock review count
    pricePerNightTotal: h.nightlyPrice,
    // Real tracked links come from Stay22; the catalog stores an explicit
    // placeholder, so fall back to the bare Stay22 homepage in the UI.
    bookingUrl: "https://www.stay22.com",
    provider: "Prototype estimate",
    source: "fallback",
  });

  const hotels = [...destination.hotels].sort((a, b) =>
    a.id === chosenHotelId ? -1 : b.id === chosenHotelId ? 1 : 0,
  );
  return hotels.map(mapHotel);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destinationId = searchParams.get("destination") as CatalogDestinationId | null;
  const groupSize = Number(searchParams.get("adults") ?? "4") || 4;
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const chosenHotelId = searchParams.get("hotel");
  const nights =
    checkin && checkout
      ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000))
      : 2;

  const destination = destinationId ? CATALOG_BY_ID[destinationId] : undefined;
  if (!destination) {
    return NextResponse.json({ error: "Unknown destination" }, { status: 400 });
  }

  const apiKey = process.env.STAY22_API_KEY;
  const fallback = () =>
    NextResponse.json({
      accommodations: catalogFallback(destination, chosenHotelId),
      source: "fallback",
    });

  if (!apiKey || !checkin || !checkout) return fallback();

  try {
    const url = new URL("https://api.stay22.com/v2/accommodations");
    url.searchParams.set("address", destination.stay22Query);
    url.searchParams.set("checkin", checkin);
    url.searchParams.set("checkout", checkout);
    url.searchParams.set("adults", String(groupSize));
    url.searchParams.set("rooms", "1");
    url.searchParams.set("pageSize", "3");
    if (process.env.STAY22_AID) url.searchParams.set("aid", process.env.STAY22_AID);

    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) throw new Error(`Stay22 responded ${res.status}`);

    const data = await res.json();
    const mapped = (data?.results ?? [])
      .map((r: Stay22Result) => mapStay22Result(r, nights))
      .filter((x: Accommodation | null): x is Accommodation => x !== null);

    if (mapped.length === 0) throw new Error("No usable Stay22 results");

    return NextResponse.json({ accommodations: mapped, source: "stay22" });
  } catch {
    return fallback();
  }
}
