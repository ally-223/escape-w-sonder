"use client";

import { useState, useEffect } from "react";

interface SliderQuestionProps {
  question: string;
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
  step?: number;
  onAnswer: (value: number) => void;
  selectedAnswer?: number;
}

export default function SliderQuestion({
  question,
  minLabel,
  maxLabel,
  min = 0,
  max = 100,
  step = 1,
  onAnswer,
  selectedAnswer,
}: SliderQuestionProps) {
  const [value, setValue] = useState(selectedAnswer ?? Math.floor((min + max) / 2));

  useEffect(() => {
    if (selectedAnswer !== undefined) setValue(selectedAnswer);
  }, [selectedAnswer]);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onAnswer(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-8">
      <h3 className="text-xl md:text-2xl font-serif font-light text-center text-white">
        {question}
      </h3>

      <div className="space-y-4 px-2">
        <div className="relative pt-14">
          <div
            className="absolute top-0 -translate-x-1/2 rounded px-2 py-1 text-sm font-medium transition-all duration-200"
            style={{ left: `${percentage}%`, background: "#dcff73", color: "#0a0a0b" }}
          >
            {value}
          </div>

          <div className="relative h-2 rounded-full bg-white/20">
            <div
              className="absolute h-full rounded-full transition-all duration-200"
              style={{ width: `${percentage}%`, background: "#dcff73" }}
            />
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={question}
          />

          <div
            className="absolute top-1/2 w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 border-2 border-white"
            style={{ left: `${percentage}%`, background: "#dcff73" }}
          />
        </div>

        <div className="flex justify-between text-sm text-white/60">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
