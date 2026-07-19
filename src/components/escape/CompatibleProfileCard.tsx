"use client";

import Image from "next/image";
import type { CompatibleProfile } from "@/lib/escape/types";

export default function CompatibleProfileCard({ profile }: { profile: CompatibleProfile }) {
  return (
    <div className="holo-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid #27272a" }}>
          <Image src={profile.avatar} alt={profile.firstName} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#f5f5f4]">{profile.firstName}</p>
          <p className="text-xs text-[#a1a1aa] truncate">{profile.bio}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-serif" style={{ color: "#dcff73" }}>{profile.compatibility}%</p>
          <p className="text-[10px] text-[#71717a] uppercase tracking-wide">match</p>
        </div>
      </div>
      <ul className="space-y-1 text-xs text-[#a1a1aa]">
        {profile.reasons.map((reason, i) => (
          <li key={i} className="flex gap-1.5">
            <span style={{ color: "#dcff73" }}>·</span>
            <span className="first-letter:uppercase">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
