"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { decodeTrip, encodeTrip } from "@/lib/escape/tripEncoding";
import { deriveTrip } from "@/lib/escape/deriveTrip";
import { CATALOG_BY_ID } from "@/lib/escape/data/catalog";
import { calculateTripCost, rentVsEscape } from "@/lib/escape/costCalculator";
import { matchCompatiblePeople } from "@/lib/escape/matching";
import { availabilityWindow } from "@/lib/escape/dates";
import AccommodationCard from "@/components/escape/AccommodationCard";
import CompatibleProfileCard from "@/components/escape/CompatibleProfileCard";
import FriendSlots from "@/components/escape/FriendSlots";
import CopyLinkRow from "@/components/escape/CopyLinkRow";
import type { Accommodation, CompatibleProfile, TripResult } from "@/lib/escape/types";

type FetchState = "loading" | "ready" | "error";

function TripContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d") || "";
  const [trip, setTrip] = useState<TripResult | null | "invalid">(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<CompatibleProfile | null>(null);

  useEffect(() => {
    const decoded = decodeTrip(encoded);
    // Older links (pre-catalog) decode but lack the stored choice fields.
    if (decoded && decoded.destinationId && decoded.planId) {
      setTrip(decoded);
      setSelectedProfileIds(decoded.selectedProfileIds ?? []);
    } else {
      setTrip("invalid");
    }
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

  const personality = derived.personalityType;
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
  const compatibleMatches = showMatches
    ? matchCompatiblePeople(derived.answers, derived.preferences.groupPersonality ?? "adventurous")
    : [];
  const selectedProfiles = compatibleMatches.filter((profile) => selectedProfileIds.includes(profile.id));
  const canAddProfile = selectedProfileIds.length < Math.max(derived.preferences.groupSize - 1, 0);
  const toggleProfile = (profileId: string) => {
    setSelectedProfileIds((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : current.length < Math.max(derived.preferences.groupSize - 1, 0)
          ? [...current, profileId]
          : current,
    );
  };
  const sharedTrip: TripResult = { ...trip, selectedProfileIds };
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/escape/invite?d=${encodeTrip(sharedTrip)}` : "";
  const activityLimit = ({ "very relaxing": 1, relaxing: 2, balanced: 3, lively: 4, packed: Number.POSITIVE_INFINITY } as const)[derived.preferences.pace] ?? Number.POSITIVE_INFINITY;

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
            {window_.label} · {plan.title} · {personality.name}
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
                  {day.activities.slice(0, activityLimit).map((activity, i) => (
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

        {showFriends && !showMatches && (
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-light">Bring your people</h2>
            <FriendSlots groupSize={derived.preferences.groupSize} profile={derived.profile} selectedProfiles={selectedProfiles} />
          </section>
        )}

        {showMatches && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-serif font-light">People who match your energy</h2>
              <p className="mt-1 text-xs text-[#71717a]">Add up to three people. Compatibility comes from your personality types.</p>
            </div>
            <FriendSlots groupSize={derived.preferences.groupSize} profile={derived.profile} selectedProfiles={selectedProfiles} />
            <div className="grid sm:grid-cols-1 gap-3">
              {compatibleMatches.map((profile) => (
                <CompatibleProfileCard
                  key={profile.id}
                  profile={profile}
                  selected={selectedProfileIds.includes(profile.id)}
                  canAdd={canAddProfile}
                  onOpen={() => setActiveProfile(profile)}
                  onToggle={() => toggleProfile(profile.id)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-light">Share this escape</h2>
          {shareUrl && <CopyLinkRow link={shareUrl} title={`${plan.title} in ${destination.name}`} />}
        </section>
      </div>

      {activeProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProfile.firstName} profile`}
          onClick={() => setActiveProfile(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#18181b] p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => setActiveProfile(null)} className="absolute right-4 top-4 text-white/50 hover:text-white" aria-label="Close profile">✕</button>
            <div className="text-center space-y-4">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-[#dcff73]">
                <Image src={activeProfile.avatar} alt={activeProfile.firstName} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-serif text-3xl font-light">{activeProfile.firstName}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#dcff73]">{activeProfile.personalityName}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">{activeProfile.bio}</p>
              </div>
              <div className="font-serif text-3xl text-[#dcff73]">{activeProfile.compatibility}% <span className="font-sans text-xs uppercase tracking-wide text-[#71717a]">match</span></div>
              <div className="flex flex-wrap justify-center gap-2">
                {activeProfile.strengths.slice(0, 3).map((strength) => (
                  <span key={strength} className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/75">{strength}</span>
                ))}
              </div>
              <ul className="space-y-1 text-left text-xs text-[#a1a1aa]">
                {activeProfile.reasons.map((reason) => <li key={reason}>· {reason}</li>)}
              </ul>
              <button
                type="button"
                disabled={!selectedProfileIds.includes(activeProfile.id) && !canAddProfile}
                onClick={() => toggleProfile(activeProfile.id)}
                className="w-full rounded-full bg-[#dcff73] px-5 py-3 text-sm font-medium text-[#0a0a0b] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {selectedProfileIds.includes(activeProfile.id) ? "Remove from trip" : canAddProfile ? "Add to trip" : "Group is full"}
              </button>
            </div>
          </div>
        </div>
      )}
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
