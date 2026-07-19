"use client";

interface SingleChoiceQuestionProps<T extends string> {
  question: string;
  options: { value: T; label: string }[];
  selectedAnswer?: T;
  onAnswer: (value: T) => void;
}

export default function SingleChoiceQuestion<T extends string>({
  question,
  options,
  selectedAnswer,
  onAnswer,
}: SingleChoiceQuestionProps<T>) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl md:text-2xl font-serif font-light text-center text-white">
        {question}
      </h3>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
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
    </div>
  );
}
