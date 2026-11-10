-- =========================================================
-- EMPLOYEE ENGAGEMENT SURVEY - SUPABASE DATABASE SCHEMA
-- Shared Workspace Safe (Prefixed with eos_ to avoid table collisions)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: eos_responses (Metadata & Identity for Employee Engagement Survey)
CREATE TABLE IF NOT EXISTS public.eos_responses (
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

-- Table 2: eos_answers (Item Scores 1-10 for Employee Engagement Survey)
CREATE TABLE IF NOT EXISTS public.eos_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.eos_responses(id) ON DELETE CASCADE,
    question_id INT NOT NULL,
    category TEXT NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 10)
);

-- Table 3: eos_admin_users (Optional dedicated admin list for Employee Survey)
CREATE TABLE IF NOT EXISTS public.eos_admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for performance (Prefixed with idx_eos_ so they never collide)
CREATE INDEX IF NOT EXISTS idx_eos_answers_response_id ON public.eos_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_eos_answers_category ON public.eos_answers(category);
CREATE INDEX IF NOT EXISTS idx_eos_responses_direktorat ON public.eos_responses(direktorat);
CREATE INDEX IF NOT EXISTS idx_eos_responses_divisi ON public.eos_responses(divisi);
CREATE INDEX IF NOT EXISTS idx_eos_responses_created_at ON public.eos_responses(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.eos_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eos_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eos_admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "eos_allow_public_insert_responses" ON public.eos_responses;
DROP POLICY IF EXISTS "eos_allow_public_insert_answers" ON public.eos_answers;
DROP POLICY IF EXISTS "eos_allow_authenticated_read_responses" ON public.eos_responses;
DROP POLICY IF EXISTS "eos_allow_authenticated_read_answers" ON public.eos_answers;
DROP POLICY IF EXISTS "eos_allow_authenticated_delete_responses" ON public.eos_responses;
DROP POLICY IF EXISTS "eos_allow_authenticated_read_admins" ON public.eos_admin_users;

-- RLS Policy: Anyone (anonymous or authenticated) can submit (INSERT) survey responses
CREATE POLICY "eos_allow_public_insert_responses"
    ON public.eos_responses
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "eos_allow_public_insert_answers"
    ON public.eos_answers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- RLS Policy: Authenticated Supabase users (Admin) can SELECT
CREATE POLICY "eos_allow_authenticated_read_responses"
    ON public.eos_responses
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "eos_allow_authenticated_read_answers"
    ON public.eos_answers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "eos_allow_authenticated_delete_responses"
    ON public.eos_responses
    FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "eos_allow_authenticated_read_admins"
    ON public.eos_admin_users
    FOR SELECT
    TO authenticated
    USING (true);
