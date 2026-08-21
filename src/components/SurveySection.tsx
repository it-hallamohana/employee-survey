import React from 'react';
import { QuestionCategory, AnswersMap } from '../lib/types';
import { RatingScalePill } from './RatingScalePill';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface SurveySectionProps {
  category: QuestionCategory;
  categoryIndex: number;
  totalCategories: number;
  answers: AnswersMap;
  openFeedback: string;
  onAnswerChange: (questionId: number, score: number) => void;
  onFeedbackChange: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const SurveySection: React.FC<SurveySectionProps> = ({
  category,
  categoryIndex,
  totalCategories,
  answers,
  openFeedback,
  onAnswerChange,
  onFeedbackChange,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
}) => {
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Check if all scale questions in this section have been answered
  const unansweredCount = category.questions.filter(
    (q) => q.type === 'scale' && (answers[q.id] === undefined || answers[q.id] === null)
  ).length;

  const isLastCategory = categoryIndex === totalCategories - 1;

  const handleNextClick = () => {
    if (unansweredCount > 0) {
      setValidationError(`Masih terdapat ${unansweredCount} pertanyaan yang belum diisi pada bagian ini.`);
      return;
    }
    setValidationError(null);
    onNext();
  };

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setValidationError(`Masih terdapat ${unansweredCount} pertanyaan yang belum diisi.`);
      return;
    }
    setValidationError(null);
    onSubmit();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Section Header & Progress Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300 font-medium">
          <span className="bg-slate-800 px-3 py-1 rounded text-slate-200 uppercase tracking-wider font-semibold self-start sm:self-auto">
            Bagian {categoryIndex + 1} dari {totalCategories}
          </span>
          <span>
            {unansweredCount === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Semua pertanyaan bagian ini terisi
              </span>
            ) : (
              <span>{unansweredCount} pertanyaan tersisa</span>
            )}
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {category.title}
          </h2>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((categoryIndex + 1) / totalCategories) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions Container */}
      <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-100">
        {category.questions.map((q, idx) => (
          <div key={q.id} className={idx === 0 ? 'space-y-4' : 'pt-6 space-y-4'}>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700 mt-0.5">
                {q.id}
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm sm:text-base font-medium text-slate-900 leading-snug">
                  {q.title}
                </p>
                {q.description && (
                  <p className="text-xs text-slate-500">{q.description}</p>
                )}
              </div>
            </div>

            {q.type === 'scale' ? (
              <div className="pl-0 sm:pl-10">
                <RatingScalePill
                  questionId={q.id}
                  value={answers[q.id]}
                  onChange={(val) => {
                    onAnswerChange(q.id, val);
                    if (validationError) setValidationError(null);
                  }}
                />
              </div>
            ) : (
              <div className="pl-0 sm:pl-10 space-y-2">
                <textarea
                  rows={4}
                  value={openFeedback}
                  onChange={(e) => onFeedbackChange(e.target.value)}
                  placeholder="Tuliskan saran, perubahan, atau masukan yang Anda harapkan dari perusahaan secara detail di sini..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="mx-6 sm:mx-8 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {isLastCategory ? (
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim Jawaban...' : 'Kirim Seluruh Jawaban'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
