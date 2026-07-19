"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function CopyLinkRow({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex items-center gap-2 rounded-2xl p-2 pl-4"
      style={{ background: "#18181b", border: "1px solid #27272a" }}
    >
      <span className="text-xs text-[#a1a1aa] truncate flex-1">{link}</span>
      <button
        onClick={handleCopy}
        className="rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors"
        style={
          copied
            ? { background: "#18181b", color: "#dcff73", border: "1px solid rgba(220,255,115,0.5)" }
            : { background: "#dcff73", color: "#0a0a0b" }
        }
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
