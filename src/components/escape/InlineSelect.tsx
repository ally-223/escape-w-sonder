"use client";

interface InlineSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
}

export default function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  label,
}: InlineSelectProps<T>) {
  return (
    <span className="relative inline-block">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => {
          onChange(e.target.value as T);
          e.target.blur();
        }}
        className="appearance-none bg-transparent border-b-2 pr-6 pl-1 py-0.5 font-serif font-medium cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
        style={{ color: "#dcff73", borderColor: "rgba(220,255,115,0.5)" }}
      >
        {options.map((option) => (
          <option key={option} value={option} style={{ background: "#18181b", color: "#f5f5f4" }}>
            {option}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs"
        style={{ color: "#dcff73" }}
      >
        ▾
      </span>
    </span>
  );
}
