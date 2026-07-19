"use client";

interface ChoiceQuestionProps {
  question: string;
  variant: "binary" | "cards";
  lowLabel: string;
  highLabel: string;
  lowHint?: string;
  highHint?: string;
  onAnswer: (value: number) => void;
  selectedAnswer?: number;
}

export default function ChoiceQuestion({
  question,
  variant,
  lowLabel,
  highLabel,
  lowHint,
  highHint,
  onAnswer,
  selectedAnswer,
}: ChoiceQuestionProps) {
  const options = [
    { value: 0, label: lowLabel, hint: lowHint },
    { value: 100, label: highLabel, hint: highHint },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl md:text-2xl font-serif font-light text-center text-white">
        {question}
      </h3>

      {variant === "binary" ? (
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              className={`w-full rounded-lg border p-4 text-left leading-snug transition-all duration-200 ${
                selectedAnswer === option.value
                  ? "border-white/70 bg-white/20 text-white"
                  : "border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              className={`rounded-lg border p-5 text-center transition-all duration-200 flex flex-col items-center gap-2 min-h-[120px] justify-center ${
                selectedAnswer === option.value
                  ? "border-white/70 bg-white/20"
                  : "border-white/20 bg-white/5 hover:border-white/50 hover:bg-white/10"
              }`}
            >
              <span className="text-base font-medium text-white">{option.label}</span>
              {option.hint && <span className="text-xs text-white/60">{option.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
