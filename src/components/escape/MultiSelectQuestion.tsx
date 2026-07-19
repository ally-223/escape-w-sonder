"use client";

interface MultiSelectQuestionProps<T extends string> {
  question: string;
  options: { value: T; label: string }[];
  selectedAnswer: T[];
  maxSelections: number;
  onAnswer: (values: T[]) => void;
}

export default function MultiSelectQuestion<T extends string>({
  question,
  options,
  selectedAnswer,
  maxSelections,
  onAnswer,
}: MultiSelectQuestionProps<T>) {
  const toggle = (value: T) => {
    if (selectedAnswer.includes(value)) {
      onAnswer(selectedAnswer.filter((item) => item !== value));
    } else if (selectedAnswer.length < maxSelections) {
      onAnswer([...selectedAnswer, value]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-serif font-light text-white">{question}</h3>
        <p className="text-sm text-white/60">Choose up to {maxSelections}</p>
      </div>
      <div className="space-y-3">
        {options.map((option) => {
          const selected = selectedAnswer.includes(option.value);
          const disabled = !selected && selectedAnswer.length >= maxSelections;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option.value)}
              className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-white/70 bg-white/20 text-white"
                  : "border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
              } ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
            >
              <span className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px]"
                  style={{
                    borderColor: selected ? "#dcff73" : "rgba(255,255,255,0.35)",
                    color: "#dcff73",
                    background: selected ? "rgba(220,255,115,0.12)" : "transparent",
                  }}
                >
                  {selected ? "✓" : ""}
                </span>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
