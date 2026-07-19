"use client";

import Image from "next/image";
import type { CompatibleProfile } from "@/lib/escape/types";

interface CompatibleProfileCardProps {
  profile: CompatibleProfile;
  selected: boolean;
  canAdd: boolean;
  onOpen: () => void;
  onToggle: () => void;
}

export default function CompatibleProfileCard({ profile, selected, canAdd, onOpen, onToggle }: CompatibleProfileCardProps) {
  return (
    <div className="holo-card rounded-2xl p-4 space-y-3">
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid #27272a" }}>
          <Image src={profile.avatar} alt={profile.firstName} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#f5f5f4]">{profile.firstName}</p>
          <p className="text-[10px] uppercase tracking-wide text-[#dcff73]">{profile.personalityName}</p>
          <p className="text-xs text-[#a1a1aa] truncate mt-0.5">{profile.bio}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-serif text-[#dcff73]">{profile.compatibility}%</p>
          <p className="text-[10px] text-[#71717a] uppercase tracking-wide">match</p>
        </div>
      </button>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onOpen} className="text-xs text-[#a1a1aa] hover:text-white">View profile</button>
        <button
          type="button"
          onClick={onToggle}
          disabled={!selected && !canAdd}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${!selected && !canAdd ? "cursor-not-allowed opacity-35" : ""}`}
          style={selected ? { border: "1px solid rgba(220,255,115,0.5)", color: "#dcff73" } : { background: "#dcff73", color: "#0a0a0b" }}
        >
          {selected ? "Remove" : "Add to trip"}
        </button>
      </div>
    </div>
  );
}
