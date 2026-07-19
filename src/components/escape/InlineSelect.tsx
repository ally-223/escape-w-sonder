"use client";

import { useEffect, useRef, useState } from "react";

export interface InlineSelectOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

interface InlineSelectProps<T extends string> {
  value: T;
  options: readonly InlineSelectOption<T>[];
  onChange: (value: T) => void;
  label: string;
}

export default function InlineSelect<T extends string>({ value, options, onChange, label }: InlineSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnPointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="border-b-2 bg-transparent py-0.5 pl-1 pr-6 text-left font-serif font-medium outline-none"
        style={{ color: "#dcff73", borderColor: "rgba(220,255,115,0.5)" }}
      >
        {selected.label}
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs">▾</span>
      </button>
      {open && (
        <span
          role="listbox"
          aria-label={label}
          className="absolute left-1/2 top-full z-40 mt-2 block w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl p-2 text-left shadow-2xl"
          style={{ background: "#18181b", border: "1px solid #3f3f46" }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className="block w-full rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-white/5"
              >
                <span className="block text-sm" style={{ color: isSelected ? "#dcff73" : "#f5f5f4" }}>{option.label}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-white/45">{option.description}</span>
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}
