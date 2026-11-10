'use client';

import React, { useState } from 'react';
import { FormHeader } from '@/components/FormHeader';
import { DemographicsForm } from '@/components/DemographicsForm';
import { SurveySection } from '@/components/SurveySection';
import { SuccessState } from '@/components/SuccessState';
import { EmployeeDemographics, AnswersMap } from '@/lib/types';
import { SURVEY_CATEGORIES } from '@/lib/questions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [demographics, setDemographics] = useState<EmployeeDemographics>({
    divisi: '',
    department: '',
    level_jabatan: '',
    masa_kerja: '',
    lokasi_kerja: '',
  });

  const [answers, setAnswers] = useState<AnswersMap>({});
  const [openFeedback, setOpenFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const overallAvg = calculateOverallAverage();
    // Generate anonymous respondent label so database NOT NULL constraint on employee_name & direktorat is satisfied seamlessly
    const anonCode = `Responden #${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      if (isSupabaseConfigured()) {
        // 1. Insert into eos_responses table (segmented prefix for shared Supabase workspace)
        const { data: responseRecord, error: respError } = await supabase
          .from('eos_responses')
          .insert({
            employee_name: anonCode,
            employee_nik: demographics.level_jabatan, // Store Level Jabatan
            direktorat: demographics.level_jabatan,   // Store Level Jabatan in direktorat column as well
            divisi: demographics.divisi,
            department: demographics.department,
            masa_kerja: demographics.masa_kerja,
            lokasi_kerja: demographics.lokasi_kerja,
            overall_rating_avg: overallAvg,
            open_feedback: openFeedback,
          })
          .select('id')
          .single();

        if (respError) throw respError;

        // 2. Insert into eos_answers table
        if (responseRecord) {
          const answersPayload = [];

          for (const category of SURVEY_CATEGORIES) {
            for (const q of category.questions) {
              if (q.type === 'scale' && answers[q.id] !== undefined) {
                answersPayload.push({
                  response_id: responseRecord.id,
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
        }
      } else {
        // Fallback store in localStorage if Supabase env is not configured yet
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

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting survey:', err);
      setErrorMessage(
        err.message || 'Gagal mengirimkan jawaban survei. Silakan periksa koneksi Anda dan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <FormHeader />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {isSubmitted ? (
          <SuccessState employeeName="Rekan Halla Mohana" />
        ) : currentStep === 0 ? (
          <DemographicsForm
            data={demographics}
            onChange={handleDemographicChange}
            onNext={() => setCurrentStep(1)}
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
            onPrev={() => setCurrentStep((prev) => prev - 1)}
            onNext={() => setCurrentStep((prev) => prev + 1)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
