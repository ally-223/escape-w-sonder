"use client";

import type { Accommodation } from "@/lib/escape/types";

interface AccommodationCardProps {
  accommodation: Accommodation;
  perPerson?: number;
  variant?: "primary" | "compact";
}

/** Real Stay22 results include a thumbnail URL; fallback (mocked) data
 * doesn't have real property photography, so it renders a branded
 * gradient tile instead of forcing a mismatched stock image. */
function PropertyPhoto({ accommodation, className }: { accommodation: Accommodation; className: string }) {
  if (accommodation.image) {
    // eslint-disable-next-line @next/next/no-img-element -- thumbnail can be any external Stay22 CDN host
    return <img src={accommodation.image} alt={accommodation.name} className={`${className} object-cover`} />;
  }

  const initial = accommodation.name.charAt(0).toUpperCase();
  return (
    <div
      className={`${className} flex items-center justify-center`}
      style={{ background: "linear-gradient(145deg, #22261a 0%, #18181b 60%, #111015 100%)" }}
    >
      <span className="font-serif text-3xl" style={{ color: "rgba(220,255,115,0.35)" }}>
        {initial}
      </span>
    </div>
  );
}

export default function AccommodationCard({
  accommodation,
  perPerson,
  variant = "primary",
}: AccommodationCardProps) {
  if (variant === "compact") {
    return (
      <a
        href={accommodation.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="holo-card rounded-2xl overflow-hidden flex items-center gap-3 p-3 group"
      >
        <PropertyPhoto accommodation={accommodation} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#f5f5f4] truncate">{accommodation.name}</p>
          <p className="text-xs text-[#a1a1aa] truncate">{accommodation.location}</p>
          <p className="text-xs mt-0.5" style={{ color: "#dcff73" }}>
            ${accommodation.pricePerNightTotal}/night · {accommodation.provider}
          </p>
        </div>
      </a>
    );
  }

  return (
    <div className="holo-card rounded-3xl overflow-hidden">
      <div className="relative w-full h-48">
        <PropertyPhoto accommodation={accommodation} className="w-full h-full" />
        <div
          className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: "#0a0a0b", color: "#dcff73", border: "1px solid rgba(220,255,115,0.4)" }}
        >
          ★ {accommodation.ratingValue.toFixed(1)} ({accommodation.ratingCount})
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-[#f5f5f4]">{accommodation.name}</h3>
          <p className="text-sm text-[#a1a1aa]">{accommodation.location}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-[#71717a]">Total stay</p>
            <p className="text-sm text-[#f5f5f4]">${accommodation.pricePerNightTotal}/night · {accommodation.provider}</p>
          </div>
          {perPerson !== undefined && (
            <div className="text-right">
              <p className="text-xs text-[#71717a]">Per person</p>
              <p className="text-xl font-serif" style={{ color: "#dcff73" }}>${perPerson}</p>
            </div>
          )}
        </div>

        <a
          href={accommodation.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="holo-button rounded-full py-3 text-sm font-medium w-full flex items-center justify-center"
        >
          <span>Book on {accommodation.provider}</span>
        </a>
      </div>
    </div>
  );
}
