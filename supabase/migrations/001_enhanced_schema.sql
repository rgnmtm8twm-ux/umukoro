-- ============================================================
-- Ubumenyi: Enhanced Schema Migration v2
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. New enums
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.resource_language AS ENUM (
    'english', 'french', 'kinyarwanda', 'bilingual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.contributor_type AS ENUM (
    'teacher', 'school', 'institution', 'educational_org', 'individual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM (
    'pending', 'verified', 'rejected', 'suspended'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.resource_status_v2 AS ENUM (
    'draft', 'pending_review', 'approved', 'rejected', 'published', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. Enhance resources table
-- ─────────────────────────────────────────────────────────────

-- New content fields
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS topic              TEXT,
  ADD COLUMN IF NOT EXISTS combination        TEXT,
  ADD COLUMN IF NOT EXISTS language           TEXT NOT NULL DEFAULT 'english',
  ADD COLUMN IF NOT EXISTS tags               TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_official        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_institution TEXT;

-- Engagement counters
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS download_count     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count         INTEGER NOT NULL DEFAULT 0;

-- Moderation fields
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS rejection_reason   TEXT,
  ADD COLUMN IF NOT EXISTS moderation_notes   TEXT,
  ADD COLUMN IF NOT EXISTS moderation_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderator_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Approval workflow: add 'pending_review', 'rejected', 'archived' to status CHECK
-- (Supabase CHECK constraint on TEXT column — drop and re-add)
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_status_check;
ALTER TABLE public.resources
  ADD CONSTRAINT resources_status_check
  CHECK (status IN ('draft', 'pending_review', 'review', 'approved', 'rejected', 'published', 'archived'));

-- Expand resource_type to include educational_guide
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_resource_type_check;
ALTER TABLE public.resources
  ADD CONSTRAINT resources_resource_type_check
  CHECK (resource_type IN (
    'past_paper', 'marking_scheme', 'syllabus',
    'teacher_notes', 'book', 'curriculum', 'educational_guide'
  ));

-- ─────────────────────────────────────────────────────────────
-- 3. contributor_profiles table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contributor_profiles (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID         NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Public-facing info
  display_name        TEXT         NOT NULL,
  bio                 TEXT,
  avatar_url          TEXT,
  institution_name    TEXT,
  institution_type    TEXT,           -- school / university / ministry / NGO / individual
  location            TEXT,           -- e.g. "Kigali, Rwanda"
  website_url         TEXT,
  subject_specialties TEXT[]       DEFAULT '{}',

  -- Contributor classification
  contributor_type    TEXT         NOT NULL DEFAULT 'individual'
                        CHECK (contributor_type IN ('teacher','school','institution','educational_org','individual')),

  -- Verification
  verification_status TEXT         NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending','verified','rejected','suspended')),
  verified_at         TIMESTAMPTZ,
  verified_by         UUID         REFERENCES public.profiles(id) ON DELETE SET NULL,
  verification_notes  TEXT,

  -- Stats (updated via triggers / functions)
  published_count     INTEGER      NOT NULL DEFAULT 0,

  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- updated_at trigger for contributor_profiles
DROP TRIGGER IF EXISTS contributor_profiles_updated_at ON public.contributor_profiles;
CREATE TRIGGER contributor_profiles_updated_at
  BEFORE UPDATE ON public.contributor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. topics table (reference / taxonomy)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.topics (
  id          UUID   DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT   NOT NULL,
  slug        TEXT   NOT NULL UNIQUE,
  subject     TEXT,
  level       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. resource_downloads log table (for audit trail)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id  UUID        NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash      TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast count queries
CREATE INDEX IF NOT EXISTS resource_downloads_resource_id_idx
  ON public.resource_downloads(resource_id);

-- ─────────────────────────────────────────────────────────────
-- 6. Functions: increment counters
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_view_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update contributor published_count
CREATE OR REPLACE FUNCTION public.update_contributor_published_count()
RETURNS TRIGGER AS $$
BEGIN
  -- After a resource is published, update the contributor's count
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.uploaded_by IS NOT NULL THEN
      UPDATE public.contributor_profiles
      SET published_count = (
        SELECT COUNT(*) FROM public.resources
        WHERE uploaded_by = NEW.uploaded_by AND status = 'published'
      )
      WHERE user_id = NEW.uploaded_by;
    END IF;
    IF OLD.status = 'published' AND NEW.status != 'published' AND NEW.uploaded_by IS NOT NULL THEN
      UPDATE public.contributor_profiles
      SET published_count = (
        SELECT COUNT(*) FROM public.resources
        WHERE uploaded_by = NEW.uploaded_by AND status = 'published'
      )
      WHERE user_id = NEW.uploaded_by;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resources_update_contributor_count ON public.resources;
CREATE TRIGGER resources_update_contributor_count
  AFTER UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_contributor_published_count();

-- ─────────────────────────────────────────────────────────────
-- 7. RLS for new tables
-- ─────────────────────────────────────────────────────────────

-- contributor_profiles
ALTER TABLE public.contributor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified contributor profiles"
  ON public.contributor_profiles FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Authenticated users can view all contributor profiles"
  ON public.contributor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own contributor profile"
  ON public.contributor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributor profile"
  ON public.contributor_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read topics"
  ON public.topics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage topics"
  ON public.topics FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- resource_downloads
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can log downloads"
  ON public.resource_downloads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read download logs"
  ON public.resource_downloads FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 8. Indexes for performance
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS resources_status_idx        ON public.resources(status);
CREATE INDEX IF NOT EXISTS resources_level_idx         ON public.resources(level);
CREATE INDEX IF NOT EXISTS resources_resource_type_idx ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS resources_subject_idx       ON public.resources(subject);
CREATE INDEX IF NOT EXISTS resources_year_idx          ON public.resources(year);
CREATE INDEX IF NOT EXISTS resources_topic_idx         ON public.resources(topic);
CREATE INDEX IF NOT EXISTS resources_language_idx      ON public.resources(language);
CREATE INDEX IF NOT EXISTS resources_uploaded_by_idx   ON public.resources(uploaded_by);
CREATE INDEX IF NOT EXISTS resources_tags_gin_idx      ON public.resources USING GIN(tags);

CREATE INDEX IF NOT EXISTS contributor_profiles_verification_idx
  ON public.contributor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS contributor_profiles_user_id_idx
  ON public.contributor_profiles(user_id);

-- ─────────────────────────────────────────────────────────────
-- 9. Seed: A-Level combinations taxonomy
-- ─────────────────────────────────────────────────────────────

-- Common Rwanda A-Level combinations
INSERT INTO public.topics (name, slug, subject, level) VALUES
  ('Algebra', 'algebra', 'Mathematics', 'a_level'),
  ('Calculus', 'calculus', 'Mathematics', 'a_level'),
  ('Statistics', 'statistics', 'Mathematics', 'a_level'),
  ('Mechanics', 'mechanics', 'Mathematics', 'a_level'),
  ('Organic Chemistry', 'organic-chemistry', 'Chemistry', 'a_level'),
  ('Inorganic Chemistry', 'inorganic-chemistry', 'Chemistry', 'a_level'),
  ('Physical Chemistry', 'physical-chemistry', 'Chemistry', 'a_level'),
  ('Mechanics (Physics)', 'mechanics-physics', 'Physics', 'a_level'),
  ('Electricity & Magnetism', 'electricity-magnetism', 'Physics', 'a_level'),
  ('Waves & Optics', 'waves-optics', 'Physics', 'a_level'),
  ('Cell Biology', 'cell-biology', 'Biology', 'a_level'),
  ('Genetics', 'genetics', 'Biology', 'a_level'),
  ('Ecology', 'ecology', 'Biology', 'a_level'),
  ('Macroeconomics', 'macroeconomics', 'Economics', 'a_level'),
  ('Microeconomics', 'microeconomics', 'Economics', 'a_level'),
  ('Fractions & Decimals', 'fractions-decimals', 'Mathematics', 'primary'),
  ('Number Patterns', 'number-patterns', 'Mathematics', 'primary'),
  ('Reading Comprehension', 'reading-comprehension', 'English', 'o_level'),
  ('Grammar', 'grammar', 'English', 'o_level'),
  ('Trigonometry', 'trigonometry', 'Mathematics', 'o_level'),
  ('Equations', 'equations', 'Mathematics', 'o_level'),
  ('Forces & Motion', 'forces-motion', 'Physics', 'o_level'),
  ('Acids & Bases', 'acids-bases', 'Chemistry', 'o_level'),
  ('Human Biology', 'human-biology', 'Biology', 'o_level')
ON CONFLICT (slug) DO NOTHING;
