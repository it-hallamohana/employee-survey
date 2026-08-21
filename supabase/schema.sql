-- =========================================================
-- EMPLOYEE ENGAGEMENT SURVEY - SUPABASE DATABASE SCHEMA
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: survey_responses (Metadata & Identity)
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    employee_name TEXT NOT NULL,
    employee_nik TEXT,
    direktorat TEXT NOT NULL,
    divisi TEXT NOT NULL,
    department TEXT NOT NULL,
    masa_kerja TEXT,
    lokasi_kerja TEXT,
    overall_rating_avg NUMERIC(4, 2),
    open_feedback TEXT
);

-- Table 2: survey_answers (Item Scores)
CREATE TABLE IF NOT EXISTS public.survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
    question_id INT NOT NULL,
    category TEXT NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 10)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON public.survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_category ON public.survey_answers(category);
CREATE INDEX IF NOT EXISTS idx_responses_direktorat ON public.survey_responses(direktorat);
CREATE INDEX IF NOT EXISTS idx_responses_divisi ON public.survey_responses(divisi);

-- Enable Row Level Security (RLS)
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can submit (INSERT) survey responses
CREATE POLICY "Allow public insert to survey_responses"
    ON public.survey_responses
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public insert to survey_answers"
    ON public.survey_answers
    FOR INSERT
    WITH CHECK (true);

-- RLS Policy: Only authenticated Supabase users (Admin) can SELECT
CREATE POLICY "Allow authenticated admin read on survey_responses"
    ON public.survey_responses
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated admin read on survey_answers"
    ON public.survey_answers
    FOR SELECT
    TO authenticated
    USING (true);

-- Optional: Allow authenticated admin DELETE
CREATE POLICY "Allow authenticated admin delete on survey_responses"
    ON public.survey_responses
    FOR DELETE
    TO authenticated
    USING (true);
