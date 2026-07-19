"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { decodeTrip } from "@/lib/escape/tripEncoding";
import { deriveTrip } from "@/lib/escape/deriveTrip";
import { SEED_PROFILES } from "@/lib/escape/mockProfiles";
import { PERSONALITY_TYPES } from "@/lib/escape/personalities";
import { CATALOG_BY_ID } from "@/lib/escape/data/catalog";
import { calculateTripCost } from "@/lib/escape/costCalculator";
import { availabilityWindow } from "@/lib/escape/dates";
import type { Accommodation, TripResult } from "@/lib/escape/types";

type Status = "loading" | "ready" | "joining" | "success" | "invalid";

function InviteContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d") || "";
  const [status, setStatus] = useState<Status>("loading");
  const [trip, setTrip] = useState<TripResult | null>(null);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);

  useEffect(() => {
    const decoded = decodeTrip(encoded);
    if (!decoded || !decoded.destinationId || !decoded.planId) {
      setStatus("invalid");
      return;
    }
    setTrip(decoded);
  }, [encoded]);

  const derived = trip ? deriveTrip(trip) : null;
  const destination = derived ? CATALOG_BY_ID[derived.destinationId] : null;
  const window_ = derived
    ? availabilityWindow(derived.preferences.availabilityStart, derived.preferences.availabilityEnd)
    : null;

  useEffect(() => {
    if (!derived || !destination || !window_) return;
    fetch(
      `/api/escape/accommodation?destination=${derived.destinationId}&adults=${derived.preferences.groupSize}&checkin=${window_.checkin}&checkout=${window_.checkout}&hotel=${derived.hotelId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setAccommodation(data.accommodations?.[0] ?? null);
        setStatus("ready");
      })
      .catch(() => setStatus("ready"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derived?.destinationId, derived?.hotelId]);

  const handleJoin = () => {
    setStatus("joining");
    setTimeout(() => setStatus("success"), 900);
  };

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4] flex items-center justify-center text-center p-8">
        <div className="space-y-3">
          <p className="text-[#f87171]">This invite link is invalid or expired.</p>
          <Link href="/escape" className="text-sm" style={{ color: "#dcff73" }}>
            Explore Sonder Escape →
          </Link>
        </div>
      </div>
    );
  }

  const personality = derived?.personalityType ?? null;
  const selectedPeople = derived
    ? SEED_PROFILES.filter((profile) => derived.selectedProfileIds?.includes(profile.id))
    : [];
  const plan = destination && derived
    ? destination.plans.find((p) => p.id === derived.planId) ?? destination.plans[0]
    : null;
  const chosenHotel = destination && derived
    ? destination.hotels.find((h) => h.id === derived.hotelId) ?? destination.hotels[1]
    : null;
  const cost =
    destination && derived && plan && window_
      ? calculateTripCost({
          nightlyPrice: accommodation?.pricePerNightTotal ?? chosenHotel?.nightlyPrice ?? 0,
          nights: window_.nights,
          groupSize: derived.preferences.groupSize,
          transportPerPerson: destination.estTransportCostPerPerson,
          plan,
        })
      : null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4] flex flex-col items-center justify-center p-6 relative selection:bg-[#dcff73]/30">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#dcff73]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#b7a58c]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "#dcff73", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-[#a1a1aa]">Loading this escape…</p>
          </div>
        )}

        {status === "ready" && derived && personality && destination && plan && window_ && (
          <div
            className="rounded-3xl p-8 space-y-6"
            style={{
              background: "linear-gradient(160deg, #18161f 0%, #111015 50%, #0a0a0b 100%)",
              border: "1px solid #3f3f46",
              boxShadow: "0 0 55px 8px rgba(220,255,115,0.10)",
            }}
          >
            <div className="text-center space-y-3">
              <div className="relative w-14 h-14 mx-auto overflow-hidden rounded-full flex items-center justify-center">
                <Image
                  src={derived.profile?.pfp ? `/${derived.profile.pfp}.png` : "/flat_logo.png"}
                  alt={derived.profile?.name ?? "Sonder logo"}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "#dcff73" }}>
                {derived.profile?.name
                  ? `${derived.profile.name} invited you on a mystery escape`
                  : "you're invited on a mystery escape"}
              </p>
              <h1 className="text-2xl font-serif font-light text-white">{destination.name}</h1>
              <p className="text-sm text-[#a1a1aa]">{window_.label}</p>
              <p className="text-xs text-[#71717a]">
                {plan.title} · {personality.name} vibe
              </p>
            </div>

            {(accommodation || chosenHotel) && (
              <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#0a0a0b", border: "1px solid #27272a" }}>
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(145deg, #22261a 0%, #18181b 60%, #111015 100%)" }}>
                  {accommodation?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- thumbnail can be any external Stay22 CDN host
                    <img src={accommodation.image} alt={accommodation.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-lg" style={{ color: "rgba(220,255,115,0.35)" }}>
                      {(accommodation?.name ?? chosenHotel?.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#f5f5f4] truncate">
                    {accommodation?.name ?? chosenHotel?.name}
                  </p>
                  <p className="text-[10px] text-[#a1a1aa] truncate">
                    {accommodation?.location ?? `${chosenHotel?.neighborhood}, ${destination.name}`}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {plan.days.map((day) => (
                <div key={day.day} className="flex gap-2 text-xs text-[#a1a1aa]">
                  <span style={{ color: "#dcff73" }} className="flex-shrink-0">
                    Day {day.day}
                  </span>
                  <span className="truncate">{day.label} — {day.activities[0]?.title}</span>
                </div>
              ))}
            </div>

            {selectedPeople.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#71717a]">People already added</p>
                {selectedPeople.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 rounded-xl border border-[#27272a] bg-[#0a0a0b] p-2.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full">
                      <Image src={person.avatar} alt={person.firstName} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{person.firstName}</p>
                      <p className="text-[10px] text-[#a1a1aa]">{PERSONALITY_TYPES[person.personalityId].name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cost && (
              <div className="flex justify-between text-sm pt-1" style={{ borderTop: "1px solid #27272a" }}>
                <span className="text-[#a1a1aa]">Estimated per person</span>
                <span style={{ color: "#dcff73" }}>${cost.totalPerPerson}</span>
              </div>
            )}

            <button
              onClick={handleJoin}
              className="w-full py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: "#dcff73", color: "#0a0a0b" }}
            >
              Join this escape
            </button>
          </div>
        )}

        {status === "joining" && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "#dcff73", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-[#a1a1aa]">Saving your spot...</p>
          </div>
        )}

        {status === "success" && destination && (
          <div
            className="rounded-3xl p-8 space-y-5 text-center"
            style={{
              background: "linear-gradient(160deg, #18161f 0%, #111015 50%, #0a0a0b 100%)",
              border: "1px solid #3f3f46",
              boxShadow: "0 0 55px 8px rgba(220,255,115,0.10)",
            }}
          >
            <div className="w-14 h-14 mx-auto flex items-center justify-center">
              <Image src="/flat_logo.png" alt="Sonder logo" width={56} height={56} className="object-contain" />
            </div>
            <p className="text-xl font-medium text-white">You&apos;re in!</p>
            <p className="text-sm text-[#a1a1aa]">
              See you in <span style={{ color: "#dcff73" }}>{destination.name}</span>.
            </p>
            <Link href="/escape" className="text-xs text-[#71717a] hover:opacity-80 transition-opacity block">
              Build your own escape →
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteContent />
    </Suspense>
  );
}
