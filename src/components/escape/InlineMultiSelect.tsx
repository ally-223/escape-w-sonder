"use client";

import { useEffect, useRef, useState } from "react";

interface InlineMultiSelectProps {
  values: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  max: number;
  label: string;
  /** Shown when nothing is selected — reads as "surprise me". */
  emptyLabel: string;
}

/** A sentence-embedded multi-select (native selects can't do this):
 * renders like the other blanks, opens a checkbox popover, caps at
 * `max` selections. */
export default function InlineMultiSelect({
  values,
  options,
  onChange,
  max,
  label,
  emptyLabel,
}: InlineMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else if (values.length < max) {
      onChange([...values, value]);
    }
  };

  const display =
    values.length === 0
      ? emptyLabel
      : values
          .map((v) => options.find((o) => o.value === v)?.label ?? v)
          .join(", ");

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className="appearance-none bg-transparent border-b-2 pr-6 pl-1 py-0.5 font-serif font-medium cursor-pointer outline-none text-left"
        style={{ color: "#dcff73", borderColor: "rgba(220,255,115,0.5)" }}
      >
        {display}
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs">
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-30 w-64 rounded-2xl p-2 text-left shadow-xl"
          style={{ background: "#18181b", border: "1px solid #3f3f46" }}
        >
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/40 font-sans">
            pick up to {max}
          </p>
          {options.map((option) => {
            const selected = values.includes(option.value);
            const disabled = !selected && values.length >= max;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                disabled={disabled}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-sans transition-colors ${
                  disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"
                }`}
                style={{ color: selected ? "#dcff73" : "#f5f5f4" }}
              >
                <span
                  className="w-4 h-4 rounded flex items-center justify-center text-[10px] flex-shrink-0"
                  style={{
                    border: `1px solid ${selected ? "#dcff73" : "#52525b"}`,
                    background: selected ? "rgba(220,255,115,0.15)" : "transparent",
                  }}
                >
                  {selected ? "✓" : ""}
                </span>
                {option.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              onChange([]);
              setOpen(false);
            }}
            className="w-full rounded-xl px-3 py-2 text-xs text-white/50 hover:bg-white/5 text-left font-sans"
          >
            clear — {emptyLabel}
          </button>
        </div>
      )}
    </span>
  );
}
