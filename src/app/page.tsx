'use client';

import React, { useState, useEffect } from 'react';
import { FormHeader } from '@/components/FormHeader';
import { DemographicsForm } from '@/components/DemographicsForm';
import { SurveySection } from '@/components/SurveySection';
import { SuccessState } from '@/components/SuccessState';
import { EmployeeDemographics, AnswersMap } from '@/lib/types';
import { SURVEY_CATEGORIES } from '@/lib/questions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'halla_mohana_eos_draft_v1';

const INITIAL_DEMOGRAPHICS: EmployeeDemographics = {
  divisi: '',
  department: '',
  level_jabatan: '',
  masa_kerja: '',
  lokasi_kerja: '',
};

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [demographics, setDemographics] = useState<EmployeeDemographics>(INITIAL_DEMOGRAPHICS);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [openFeedback, setOpenFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-save & session restore states
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [restoredBanner, setRestoredBanner] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // 1. Restore saved draft from localStorage on initial load
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.demographics) setDemographics(parsed.demographics);
          if (parsed.answers) setAnswers(parsed.answers);
          if (typeof parsed.openFeedback === 'string') setOpenFeedback(parsed.openFeedback);
          if (typeof parsed.currentStep === 'number' && parsed.currentStep >= 0 && parsed.currentStep <= SURVEY_CATEGORIES.length) {
            setCurrentStep(parsed.currentStep);
          }
          // Show notification if user already had progress
          const hasAnswers = parsed.answers && Object.keys(parsed.answers).length > 0;
          const hasDemo = parsed.demographics && Object.values(parsed.demographics).some((v) => !!v);
          if (hasAnswers || hasDemo || parsed.currentStep > 0) {
            setRestoredBanner(true);
            if (parsed.updatedAt) {
              setLastSavedTime(
                new Date(parsed.updatedAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              );
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore survey draft:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Automatically save draft to localStorage whenever state changes
  useEffect(() => {
    if (!isHydrated || isSubmitted) return;

    try {
      const now = new Date();
      const payload = {
        currentStep,
        demographics,
        answers,
        openFeedback,
        updatedAt: now.toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setLastSavedTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch (e) {
      console.error('Failed to auto-save survey draft:', e);
    }
  }, [currentStep, demographics, answers, openFeedback, isHydrated, isSubmitted]);

  const handleResetSession = () => {
    if (!window.confirm('Apakah Anda yakin ingin mengulang pengisian survei dari awal? Jawaban yang tersimpan sementara akan dihapus.')) {
      return;
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDemographics(INITIAL_DEMOGRAPHICS);
    setAnswers({});
    setOpenFeedback('');
    setCurrentStep(0);
    setRestoredBanner(false);
    setErrorMessage(null);
  };

  const handleDemographicChange = (field: keyof EmployeeDemographics, value: string) => {
    setDemographics((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateOverallAverage = (): number => {
    const scores = Object.values(answers);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const overallAvg = calculateOverallAverage();
    const anonCode = `Responden #${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Generate UUID on client so we don't need .select('id') after insert
    const responseId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    try {
      if (isSupabaseConfigured()) {
        // 1. Insert into eos_responses table
        const { error: respError } = await supabase
          .from('eos_responses')
          .insert({
            id: responseId,
            employee_name: anonCode,
            employee_nik: demographics.level_jabatan,
            direktorat: demographics.level_jabatan,
            divisi: demographics.divisi,
            department: demographics.department,
            masa_kerja: demographics.masa_kerja,
            lokasi_kerja: demographics.lokasi_kerja,
            overall_rating_avg: overallAvg,
            open_feedback: openFeedback,
          });

        if (respError) throw respError;

        // 2. Insert into eos_answers table
        const answersPayload = [];

        for (const category of SURVEY_CATEGORIES) {
          for (const q of category.questions) {
            if (q.type === 'scale' && answers[q.id] !== undefined) {
              answersPayload.push({
                response_id: responseId,
                question_id: q.id,
                category: category.title,
                score: answers[q.id],
              });
            }
          }
        }

        if (answersPayload.length > 0) {
          const { error: ansError } = await supabase
            .from('eos_answers')
            .insert(answersPayload);

          if (ansError) throw ansError;
        }
      } else {
        const existingStr = localStorage.getItem('survey_responses_fallback') || '[]';
        const existing = JSON.parse(existingStr);
        existing.push({
          id: `fallback-${Date.now()}`,
          created_at: new Date().toISOString(),
          employee_name: anonCode,
          employee_nik: demographics.level_jabatan,
          direktorat: demographics.level_jabatan,
          divisi: demographics.divisi,
          department: demographics.department,
          masa_kerja: demographics.masa_kerja,
          lokasi_kerja: demographics.lokasi_kerja,
          overall_rating_avg: overallAvg,
          open_feedback: openFeedback,
          answers: Object.entries(answers).map(([qId, score]) => ({
            question_id: Number(qId),
            score,
          })),
        });
        localStorage.setItem('survey_responses_fallback', JSON.stringify(existing));
      }

      // Clear saved draft after successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setRestoredBanner(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting survey:', err);
      setErrorMessage(
        err.message || 'Gagal mengirimkan jawaban survei. Tenang, jawaban Anda telah tersimpan otomatis di perangkat ini. Silakan coba klik Kirim lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredQuestionsCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <FormHeader />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 flex-1 space-y-4">
        {/* Session Auto-Save & Restore Status Bar */}
        {!isSubmitted && isHydrated && (answeredQuestionsCount > 0 || currentStep > 0) && (
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900">
                  {restoredBanner ? 'Sesi pengisian terakhir Anda berhasil dipulihkan.' : 'Progres tersimpan otomatis di perangkat ini.'}
                </span>
                <span className="text-slate-500 ml-1.5">
                  ({answeredQuestionsCount} dari 90 pertanyaan terjawab{lastSavedTime ? ` • Disimpan ${lastSavedTime}` : ''})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetSession}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 font-medium transition-colors self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi dari Awal</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {isSubmitted ? (
          <SuccessState employeeName="Rekan Halla Mohana" />
        ) : currentStep === 0 ? (
          <DemographicsForm
            data={demographics}
            onChange={handleDemographicChange}
            onNext={() => handleStepChange(1)}
          />
        ) : (
          <SurveySection
            category={SURVEY_CATEGORIES[currentStep - 1]}
            categoryIndex={currentStep - 1}
            totalCategories={SURVEY_CATEGORIES.length}
            answers={answers}
            openFeedback={openFeedback}
            onAnswerChange={handleAnswerChange}
            onFeedbackChange={setOpenFeedback}
            onPrev={() => handleStepChange(currentStep - 1)}
            onNext={() => handleStepChange(currentStep + 1)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
