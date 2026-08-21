import React from 'react';

interface RatingScalePillProps {
  questionId: number;
  value?: number;
  onChange: (value: number) => void;
}

export const RatingScalePill: React.FC<RatingScalePillProps> = ({
  questionId,
  value,
  onChange,
}) => {
  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {scores.map((score) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-label={`Skor ${score} untuk pertanyaan ${questionId}`}
              className={`
                flex-1 min-w-[36px] max-w-[48px] h-10 rounded-lg text-sm font-semibold transition-all duration-150 border
                flex items-center justify-center select-none
                ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }
              `}
            >
              {score}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 pt-1">
        <span>1: Sangat Tidak Setuju</span>
        <span>10: Sangat Setuju</span>
      </div>
    </div>
  );
};
