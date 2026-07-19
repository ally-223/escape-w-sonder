"use client";

import Image from "next/image";
import type { CompatibleProfile, EscapeProfile } from "@/lib/escape/types";

interface FriendSlotsProps {
  groupSize: number;
  profile?: EscapeProfile;
  selectedProfiles?: CompatibleProfile[];
}

export default function FriendSlots({ groupSize, profile, selectedProfiles = [] }: FriendSlotsProps) {
  const avatar = `/${profile?.pfp ?? "pfp1"}.png`;
  const openSlots = Math.max(groupSize - 1 - selectedProfiles.length, 0);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-[#dcff73]">
          <Image src={avatar} alt={profile?.name ?? "You"} fill className="object-cover" />
        </div>
        <span className="text-[10px] text-[#a1a1aa]">{profile?.name || "You"}</span>
      </div>

      {selectedProfiles.map((selected) => (
        <div key={selected.id} className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-white/40">
            <Image src={selected.avatar} alt={selected.firstName} fill className="object-cover" />
          </div>
          <span className="text-[10px] text-[#a1a1aa]">{selected.firstName}</span>
        </div>
      ))}

      {Array.from({ length: openSlots }).map((_, index) => (
        <div key={index} className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg border-2 border-dashed border-[#3f3f46] text-[#52525b]">+</div>
          <span className="text-[10px] text-[#71717a]">Open</span>
        </div>
      ))}
    </div>
  );
}
