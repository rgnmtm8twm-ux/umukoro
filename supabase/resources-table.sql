-- ============================================================
-- Ubumenyi: Resources Table + RLS
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT        NOT NULL,
  description     TEXT,
  resource_type   TEXT        NOT NULL CHECK (resource_type IN (
                    'past_paper', 'marking_scheme', 'syllabus',
                    'teacher_notes', 'book', 'curriculum'
                  )),
  level           TEXT        NOT NULL CHECK (level IN (
                    'primary', 'o_level', 'a_level', 'tvet'
                  )),
  subject         TEXT,
  year            INTEGER     CHECK (year >= 1990 AND year <= 2099),
  file_url        TEXT,
  file_name       TEXT,
  file_size       BIGINT,
  status          TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN (
                    'draft', 'review', 'published'
                  )),
  uploaded_by     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_by     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resources_updated_at ON public.resources;
CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Public can read published resources
CREATE POLICY "Anyone can view published resources"
  ON public.resources FOR SELECT
  USING (status = 'published');

-- Authenticated users can view all (for admin)
CREATE POLICY "Authenticated users can view all resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can upload resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Uploader or admin can update
CREATE POLICY "Uploader can update own resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by OR
         EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND role = 'admin'
         ));

-- Admin can delete
CREATE POLICY "Admin can delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Add role column to profiles if not present
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'contributor'
  CHECK (role IN ('admin', 'contributor', 'reviewer'));

-- 6. Storage bucket for resource files
-- Run this separately or via Supabase Storage UI:
-- Create a bucket named "resources" with public access = false
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  false,
  52428800, -- 50MB max per file
  ARRAY['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload to resources bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Authenticated users can view resource files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resources');

CREATE POLICY "Public can view published resource files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Uploader can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
