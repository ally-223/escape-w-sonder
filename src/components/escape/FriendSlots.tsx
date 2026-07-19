"use client";

import Image from "next/image";
import type { EscapeProfile } from "@/lib/escape/types";

interface FriendSlotsProps {
  groupSize: number;
  profile?: EscapeProfile;
}

export default function FriendSlots({ groupSize, profile }: FriendSlotsProps) {
  const openSlots = Math.max(groupSize - 1, 0);
  const avatar = `/${profile?.pfp ?? "pfp1"}.png`;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="w-14 h-14 rounded-full overflow-hidden relative"
          style={{ border: "2px solid #dcff73" }}
        >
          <Image src={avatar} alt={profile?.name ?? "You"} fill className="object-cover" />
        </div>
        <span className="text-[10px] text-[#a1a1aa]">{profile?.name || "You"}</span>
      </div>

      {Array.from({ length: openSlots }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg"
            style={{ border: "2px dashed #3f3f46", color: "#52525b" }}
          >
            +
          </div>
          <span className="text-[10px] text-[#71717a]">Open</span>
        </div>
      ))}
    </div>
  );
}
