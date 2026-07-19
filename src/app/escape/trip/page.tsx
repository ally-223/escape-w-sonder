"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { decodeTrip, encodeTrip } from "@/lib/escape/tripEncoding";
import { deriveTrip } from "@/lib/escape/deriveTrip";
import { ARCHETYPES } from "@/lib/escape/archetypes";
import { CATALOG_BY_ID } from "@/lib/escape/data/catalog";
import { calculateTripCost, rentVsEscape } from "@/lib/escape/costCalculator";
import { matchCompatiblePeople } from "@/lib/escape/matching";
import { availabilityWindow } from "@/lib/escape/dates";
import AccommodationCard from "@/components/escape/AccommodationCard";
import CompatibleProfileCard from "@/components/escape/CompatibleProfileCard";
import FriendSlots from "@/components/escape/FriendSlots";
import CopyLinkRow from "@/components/escape/CopyLinkRow";
import type { Accommodation, TripResult } from "@/lib/escape/types";

type FetchState = "loading" | "ready" | "error";

function TripContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d") || "";
  const [trip, setTrip] = useState<TripResult | null | "invalid">(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");

  useEffect(() => {
    const decoded = decodeTrip(encoded);
    // Older links (pre-catalog) decode but lack the stored choice fields.
    setTrip(decoded && decoded.destinationId && decoded.planId ? decoded : "invalid");
  }, [encoded]);

  const derived = trip && trip !== "invalid" ? deriveTrip(trip) : null;
  const destination = derived ? CATALOG_BY_ID[derived.destinationId] : null;
  const window_ = derived
    ? availabilityWindow(derived.preferences.availabilityStart, derived.preferences.availabilityEnd)
    : null;

  useEffect(() => {
    if (!derived || !destination || !window_) return;
    let cancelled = false;
    setFetchState("loading");
    fetch(
      `/api/escape/accommodation?destination=${derived.destinationId}&adults=${derived.preferences.groupSize}&checkin=${window_.checkin}&checkout=${window_.checkout}&hotel=${derived.hotelId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAccommodations(data.accommodations ?? []);
        setFetchState("ready");
      })
      .catch(() => {
        if (!cancelled) setFetchState("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derived?.destinationId, derived?.hotelId]);

  if (trip === "invalid") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4] flex items-center justify-center text-center p-8">
        <div className="space-y-3">
          <p className="text-[#f87171]">This trip link looks broken (or from an older version).</p>
          <Link href="/escape" className="text-sm" style={{ color: "#dcff73" }}>
            Start a new escape →
          </Link>
        </div>
      </div>
    );
  }

  if (!trip || !derived || !destination || !window_ || fetchState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "#dcff73", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const archetype = ARCHETYPES[derived.archetypeId];
  const plan =
    destination.plans.find((p) => p.id === derived.planId) ?? destination.plans[0];
  const chosenHotel =
    destination.hotels.find((h) => h.id === derived.hotelId) ?? destination.hotels[1];
  const primary = accommodations[0];
  const alternatives = accommodations.slice(1);
  const nightlyPrice = primary?.pricePerNightTotal ?? chosenHotel.nightlyPrice;
  const cost = calculateTripCost({
    nightlyPrice,
    nights: window_.nights,
    groupSize: derived.preferences.groupSize,
    transportPerPerson: destination.estTransportCostPerPerson,
    plan,
  });
  const rentStat = rentVsEscape(nightlyPrice, destination);
  const companionship = derived.preferences.companionship;
  const showFriends = companionship === "my friends" || companionship === "a mix of both";
  const showMatches = companionship !== "my friends";
  const compatibleMatches = showMatches ? matchCompatiblePeople(derived.answers) : [];
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/escape/invite?d=${encodeTrip(trip)}` : "";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4] pb-24 grain-overlay">
      <div className="relative w-full h-64 md:h-80">
        <Image src={destination.heroImage} alt={destination.name} fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,10,11,0.2) 0%, #0a0a0b 100%)" }}
        />
        <Link
          href="/escape"
          className="absolute top-6 left-6 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm"
          style={{ background: "rgba(10,10,11,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          ← Sonder Escape
        </Link>
        <div className="absolute bottom-6 left-6 right-6 space-y-1">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "#dcff73" }}>
            [ your mystery escape ]
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-light">{destination.name}</h1>
          <p className="text-sm text-[#a1a1aa]">
            {window_.label} · {plan.title} · {archetype.name}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 space-y-14 mt-10">
        <section className="space-y-4">
          <h2 className="text-lg font-serif font-light">Where you&apos;re staying</h2>
          {primary ? (
            <>
              <AccommodationCard accommodation={primary} perPerson={cost.accommodationPerPerson} />
              {alternatives.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {alternatives.map((alt) => (
                    <AccommodationCard key={alt.id} accommodation={alt} variant="compact" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#71717a]">No stays found — try refreshing.</p>
          )}
        </section>

        <section
          className="rounded-2xl p-5 space-y-1"
          style={{ background: "rgba(220,255,115,0.06)", border: "1px solid rgba(220,255,115,0.25)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "#dcff73" }}>
            [ worth knowing ]
          </p>
          <p className="text-sm text-[#f5f5f4] leading-relaxed">{rentStat.message}</p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-serif font-light">{plan.title}</h2>
            <p className="text-xs text-[#a1a1aa] mt-1">{plan.whyItFits}</p>
          </div>
          <div className="space-y-4">
            {plan.days.map((day) => (
              <div key={day.day} className="space-y-2">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#71717a]">
                  day {day.day} — {day.label}
                </p>
                <div className="space-y-2">
                  {day.activities.map((activity, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 flex gap-4"
                      style={{ background: "#18181b", border: "1px solid #27272a" }}
                    >
                      <div className="flex-shrink-0 w-20">
                        <p className="text-[10px] text-[#71717a] uppercase tracking-wide leading-tight">
                          {activity.slot}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#f5f5f4]">{activity.title}</p>
                        <p className="text-xs text-[#a1a1aa] mt-0.5">{activity.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-[#71717a]">
              Backup plan: {plan.backupActivity}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-serif font-light">What it costs</h2>
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: "#18181b", border: "1px solid #27272a" }}
          >
            <div className="flex justify-between text-sm text-[#a1a1aa]">
              <span>
                Accommodation (${cost.accommodationTotal} ÷ {cost.groupSize} people, {cost.nights} night{cost.nights === 1 ? "" : "s"})
              </span>
              <span>${cost.accommodationPerPerson}</span>
            </div>
            <div className="flex justify-between text-sm text-[#a1a1aa]">
              <span>Transport (round trip from U of T)</span>
              <span>${cost.transportPerPerson}</span>
            </div>
            <div className="flex justify-between text-sm text-[#a1a1aa]">
              <span>Food</span>
              <span>${cost.foodPerPerson}</span>
            </div>
            <div className="flex justify-between text-sm text-[#a1a1aa]">
              <span>Activities</span>
              <span>${cost.activitiesPerPerson}</span>
            </div>
            <div
              className="flex justify-between text-base font-medium pt-3"
              style={{ borderTop: "1px solid #27272a", color: "#f5f5f4" }}
            >
              <span>Per person</span>
              <span style={{ color: "#dcff73" }}>${cost.totalPerPerson}</span>
            </div>
            <p className="text-[10px] text-[#71717a] pt-1">
              Prototype estimates — not live quotes.
            </p>
          </div>
        </section>

        {showFriends && (
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-light">Bring your people</h2>
            <FriendSlots groupSize={derived.preferences.groupSize} profile={derived.profile} />
          </section>
        )}

        {showMatches && (
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-light">People who match your energy</h2>
            <div className="grid sm:grid-cols-1 gap-3">
              {compatibleMatches.map((profile) => (
                <CompatibleProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-light">Share this escape</h2>
          {shareUrl && <CopyLinkRow link={shareUrl} />}
        </section>
      </div>
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense>
      <TripContent />
    </Suspense>
  );
}
