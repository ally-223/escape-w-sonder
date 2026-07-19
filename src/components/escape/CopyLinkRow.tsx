"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface CopyLinkRowProps {
  link: string;
  title?: string;
}

export default function CopyLinkRow({ link, title = "Join my Sonder Escape" }: CopyLinkRowProps) {
  const [shared, setShared] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setShared(true);
    toast.success("Trip link copied");
    setTimeout(() => setShared(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: "I found a weekend escape for us.", url: link });
        toast.success("Trip shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copy();
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleShare}
        className="w-full rounded-full px-6 py-3 text-sm font-medium tracking-[0.12em] transition-transform hover:scale-[1.01] bg-[#dcff73] text-[#0a0a0b]"
      >
        {shared ? "Trip link copied!" : "Share trip with a friend"}
      </button>
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] px-3 py-2 text-center">
        <span className="block truncate text-[10px] text-[#71717a]">{link}</span>
      </div>
    </div>
  );
}
