-- ============================================================
-- Umukoro Assessment Engine — Schema Migration v1
-- Run in: Supabase Dashboard → SQL Editor
-- Depends on: 001_enhanced_schema.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Extend question_type enum
-- ─────────────────────────────────────────────────────────────

ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'true_false';
ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'written';

-- ─────────────────────────────────────────────────────────────
-- 2. New enums
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.question_status AS ENUM (
    'draft', 'pending_review', 'published', 'rejected', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.assessment_status AS ENUM (
    'draft', 'published', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Extend questions table
--    Make it a standalone question bank (paper_id → nullable)
-- ─────────────────────────────────────────────────────────────

-- Make paper_id optional (existing questions keep their paper link)
ALTER TABLE public.questions
  ALTER COLUMN paper_id DROP NOT NULL;

-- Add question bank fields
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS source_resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS explanation        TEXT,
  ADD COLUMN IF NOT EXISTS level              TEXT,
  ADD COLUMN IF NOT EXISTS subject            TEXT,
  ADD COLUMN IF NOT EXISTS language           TEXT NOT NULL DEFAULT 'english',
  ADD COLUMN IF NOT EXISTS tags               TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status             public.question_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS created_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();

-- Rename 'marks' to be clearer (keep existing column, just document)
-- questions.marks already exists — used as default_marks in assessments
-- Add difficulty level
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS difficulty         TEXT DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Backfill updated_at for existing rows
UPDATE public.questions SET updated_at = created_at WHERE updated_at IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 4. assessments table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.assessments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  description       TEXT,
  instructions      TEXT,
  level             TEXT,
  subject           TEXT,
  combination       TEXT,
  language          TEXT        NOT NULL DEFAULT 'english',
  duration_minutes  INTEGER,
  total_marks       INTEGER     NOT NULL DEFAULT 0,
  pass_mark         INTEGER,
  shuffle_questions BOOLEAN     NOT NULL DEFAULT false,
  show_results      BOOLEAN     NOT NULL DEFAULT true,
  allow_review      BOOLEAN     NOT NULL DEFAULT true,
  max_attempts      INTEGER,
  status            public.assessment_status NOT NULL DEFAULT 'draft',
  created_by        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. assessment_questions join table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID    NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id     UUID    NOT NULL REFERENCES public.questions(id)   ON DELETE CASCADE,
  order_index     INTEGER NOT NULL DEFAULT 0,
  marks_override  INTEGER,          -- overrides question.marks for this assessment
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_id, question_id)
);

-- ─────────────────────────────────────────────────────────────
-- 6. Extend attempts table
--    Add assessment_id; keep paper_id for backward compat
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.attempts
  ALTER COLUMN paper_id DROP NOT NULL;

ALTER TABLE public.attempts
  ADD COLUMN IF NOT EXISTS assessment_id      UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS score_percentage   NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();

-- ─────────────────────────────────────────────────────────────
-- 7. updated_at triggers
-- ─────────────────────────────────────────────────────────────

-- Reuse or create the trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_questions   ON public.questions;
DROP TRIGGER IF EXISTS set_updated_at_assessments ON public.assessments;
DROP TRIGGER IF EXISTS set_updated_at_attempts    ON public.attempts;

CREATE TRIGGER set_updated_at_questions
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_assessments
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_attempts
  BEFORE UPDATE ON public.attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 8. auto-update assessments.total_marks when questions change
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_assessment_total_marks()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.assessments
  SET total_marks = (
    SELECT COALESCE(SUM(
      CASE WHEN aq.marks_override IS NOT NULL
           THEN aq.marks_override
           ELSE q.marks
      END
    ), 0)
    FROM public.assessment_questions aq
    JOIN public.questions q ON q.id = aq.question_id
    WHERE aq.assessment_id = COALESCE(NEW.assessment_id, OLD.assessment_id)
  )
  WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_total_marks ON public.assessment_questions;
CREATE TRIGGER sync_total_marks
  AFTER INSERT OR UPDATE OR DELETE ON public.assessment_questions
  FOR EACH ROW EXECUTE FUNCTION public.sync_assessment_total_marks();

-- ─────────────────────────────────────────────────────────────
-- 9. Indexes
-- ─────────────────────────────────────────────────────────────

-- Questions
CREATE INDEX IF NOT EXISTS idx_questions_status          ON public.questions (status);
CREATE INDEX IF NOT EXISTS idx_questions_level           ON public.questions (level);
CREATE INDEX IF NOT EXISTS idx_questions_subject         ON public.questions (subject);
CREATE INDEX IF NOT EXISTS idx_questions_created_by      ON public.questions (created_by);
CREATE INDEX IF NOT EXISTS idx_questions_source_resource ON public.questions (source_resource_id);
CREATE INDEX IF NOT EXISTS idx_questions_tags            ON public.questions USING GIN (tags);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_status     ON public.assessments (status);
CREATE INDEX IF NOT EXISTS idx_assessments_level      ON public.assessments (level);
CREATE INDEX IF NOT EXISTS idx_assessments_subject    ON public.assessments (subject);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON public.assessments (created_by);

-- Assessment questions
CREATE INDEX IF NOT EXISTS idx_aq_assessment ON public.assessment_questions (assessment_id, order_index);
CREATE INDEX IF NOT EXISTS idx_aq_question   ON public.assessment_questions (question_id);

-- Attempts
CREATE INDEX IF NOT EXISTS idx_attempts_user        ON public.attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment  ON public.attempts (assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_complete    ON public.attempts (user_id, is_complete);

-- ─────────────────────────────────────────────────────────────
-- 10. Row-Level Security
-- ─────────────────────────────────────────────────────────────

-- ── questions ────────────────────────────────────────────────
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_public_read"   ON public.questions;
DROP POLICY IF EXISTS "questions_owner_manage"  ON public.questions;
DROP POLICY IF EXISTS "questions_admin_all"     ON public.questions;

-- Anyone can read published questions
CREATE POLICY "questions_public_read" ON public.questions
  FOR SELECT USING (status = 'published');

-- Admins can read/write all questions
CREATE POLICY "questions_admin_all" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Contributors can manage their own questions (except publish)
CREATE POLICY "questions_owner_manage" ON public.questions
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid() AND status IN ('draft', 'pending_review', 'archived'));

-- ── assessments ──────────────────────────────────────────────
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessments_public_read"  ON public.assessments;
DROP POLICY IF EXISTS "assessments_admin_all"    ON public.assessments;
DROP POLICY IF EXISTS "assessments_owner_manage" ON public.assessments;

CREATE POLICY "assessments_public_read" ON public.assessments
  FOR SELECT USING (status = 'published');

CREATE POLICY "assessments_admin_all" ON public.assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "assessments_owner_manage" ON public.assessments
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid() AND status IN ('draft', 'archived'));

-- ── assessment_questions ─────────────────────────────────────
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aq_public_read"  ON public.assessment_questions;
DROP POLICY IF EXISTS "aq_admin_all"    ON public.assessment_questions;
DROP POLICY IF EXISTS "aq_owner_manage" ON public.assessment_questions;

CREATE POLICY "aq_public_read" ON public.assessment_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id AND status = 'published'
    )
  );

CREATE POLICY "aq_admin_all" ON public.assessment_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "aq_owner_manage" ON public.assessment_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id AND created_by = auth.uid()
    )
  );

-- ── attempts ─────────────────────────────────────────────────
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attempts_own_read"   ON public.attempts;
DROP POLICY IF EXISTS "attempts_own_insert" ON public.attempts;
DROP POLICY IF EXISTS "attempts_own_update" ON public.attempts;
DROP POLICY IF EXISTS "attempts_admin_all"  ON public.attempts;

CREATE POLICY "attempts_own_read" ON public.attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "attempts_own_insert" ON public.attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "attempts_own_update" ON public.attempts
  FOR UPDATE USING (user_id = auth.uid() AND is_complete = false);

CREATE POLICY "attempts_admin_all" ON public.attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ── attempt_answers ──────────────────────────────────────────
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "answers_own_read"   ON public.attempt_answers;
DROP POLICY IF EXISTS "answers_own_write"  ON public.attempt_answers;
DROP POLICY IF EXISTS "answers_admin_all"  ON public.attempt_answers;

CREATE POLICY "answers_own_read" ON public.attempt_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "answers_own_write" ON public.attempt_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attempts
      WHERE id = attempt_id AND user_id = auth.uid() AND is_complete = false
    )
  );

CREATE POLICY "answers_own_update" ON public.attempt_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.attempts
      WHERE id = attempt_id AND user_id = auth.uid() AND is_complete = false
    )
  );

CREATE POLICY "answers_admin_all" ON public.attempt_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 11. Helper RPC: submit_attempt
--     Marks attempt complete, calculates score, auto-marks MCQ/TF
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submit_attempt(p_attempt_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt       public.attempts%ROWTYPE;
  v_total_marks   INTEGER := 0;
  v_auto_score    INTEGER := 0;
  v_pct           NUMERIC(5,2);
BEGIN
  -- Lock the attempt row
  SELECT * INTO v_attempt FROM public.attempts
  WHERE id = p_attempt_id AND user_id = auth.uid() AND is_complete = false
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Attempt not found or already submitted');
  END IF;

  -- Auto-mark MCQ and true_false answers
  UPDATE public.attempt_answers aa
  SET
    is_correct = (
      CASE
        WHEN q.type IN ('mcq', 'true_false')
          THEN aa.selected_option = q.correct_option
        ELSE NULL  -- short/long/written require manual marking
      END
    ),
    auto_marks = (
      CASE
        WHEN q.type IN ('mcq', 'true_false') AND aa.selected_option = q.correct_option
          THEN COALESCE(aq.marks_override, q.marks)
        WHEN q.type IN ('mcq', 'true_false')
          THEN 0
        ELSE NULL
      END
    )
  FROM public.questions q
  LEFT JOIN public.assessment_questions aq
    ON aq.question_id = q.id AND aq.assessment_id = v_attempt.assessment_id
  WHERE aa.attempt_id = p_attempt_id
    AND aa.question_id = q.id;

  -- Calculate totals
  SELECT
    COALESCE(SUM(COALESCE(aq.marks_override, q.marks)), 0),
    COALESCE(SUM(COALESCE(aa.auto_marks, 0)), 0)
  INTO v_total_marks, v_auto_score
  FROM public.attempt_answers aa
  JOIN public.questions q ON q.id = aa.question_id
  LEFT JOIN public.assessment_questions aq
    ON aq.question_id = q.id AND aq.assessment_id = v_attempt.assessment_id
  WHERE aa.attempt_id = p_attempt_id;

  -- Percentage (guard div/0)
  IF v_total_marks > 0 THEN
    v_pct := ROUND((v_auto_score::NUMERIC / v_total_marks) * 100, 2);
  ELSE
    v_pct := 0;
  END IF;

  -- Mark attempt complete
  UPDATE public.attempts SET
    is_complete         = true,
    submitted_at        = NOW(),
    auto_score          = v_auto_score,
    total_marks         = v_total_marks,
    score_percentage    = v_pct,
    time_taken_seconds  = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = p_attempt_id;

  RETURN json_build_object(
    'auto_score',       v_auto_score,
    'total_marks',      v_total_marks,
    'score_percentage', v_pct
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 12. Helper RPC: upsert_answer
--     Save or update a single answer mid-attempt (progressive save)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.upsert_answer(
  p_attempt_id    UUID,
  p_question_id   UUID,
  p_selected_opt  TEXT DEFAULT NULL,
  p_answer_text   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify attempt belongs to caller and is still open
  IF NOT EXISTS (
    SELECT 1 FROM public.attempts
    WHERE id = p_attempt_id AND user_id = auth.uid() AND is_complete = false
  ) THEN
    RAISE EXCEPTION 'Attempt not found or already submitted';
  END IF;

  INSERT INTO public.attempt_answers
    (attempt_id, question_id, selected_option, answer_text)
  VALUES
    (p_attempt_id, p_question_id, p_selected_opt, p_answer_text)
  ON CONFLICT (attempt_id, question_id)
  DO UPDATE SET
    selected_option = EXCLUDED.selected_option,
    answer_text     = EXCLUDED.answer_text;
END;
$$;

-- Add unique constraint to attempt_answers for upsert to work
ALTER TABLE public.attempt_answers
  DROP CONSTRAINT IF EXISTS attempt_answers_attempt_question_unique;
ALTER TABLE public.attempt_answers
  ADD CONSTRAINT attempt_answers_attempt_question_unique
  UNIQUE (attempt_id, question_id);

-- ─────────────────────────────────────────────────────────────
-- Done
-- ─────────────────────────────────────────────────────────────
