-- ============================================================
-- Demo Content Seed — Ubumenyi & Umukoro
-- Run in: Supabase Dashboard → SQL Editor
-- Depends on: 001_enhanced_schema.sql, 002_umukoro_schema.sql
--
-- Inserts 10 sample resources, 5 sample assessments, and the
-- linked questions used by those assessments.
--
-- Every row is clearly labelled as demo / sample content via the
-- description (resources/assessments) or explanation (questions)
-- so it is easy to identify and remove later.
--
-- Idempotent: uses fixed UUIDs + ON CONFLICT DO NOTHING.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Demo resources (10)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.resources (
  id, title, description, resource_type, level, subject, year,
  language, status, published_at, is_official
) VALUES
  (
    'd0000001-0000-0000-0000-000000000001',
    'Mathematics O-Level — Sample Past Paper 2023 (demo)',
    'Sample/demo content for demonstration purposes. A practice past paper covering algebra, geometry and trigonometry topics from the Senior 3 national examination level.',
    'past_paper', 'o_level', 'Mathematics', 2023,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000002',
    'Biology S3 — Cell Structure Revision Questions (demo)',
    'Sample/demo content for demonstration purposes. Revision question set on cell organelles, mitosis and basic biochemistry for Senior 3 learners.',
    'teacher_notes', 'o_level', 'Biology', 2024,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000003',
    'Physics A-Level — Forces and Motion Marking Guide (demo)',
    'Sample/demo content for demonstration purposes. Worked solutions and marking notes for Newtonian mechanics problems at the A-Level (MPC/MCB combinations).',
    'marking_scheme', 'a_level', 'Physics', 2023,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000004',
    'English Primary — Reading Comprehension Practice (demo)',
    'Sample/demo content for demonstration purposes. Short passages with comprehension questions designed for upper primary (P5–P6) English learners.',
    'teacher_notes', 'primary', 'English', 2024,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000005',
    'Kinyarwanda — Grammar Study Notes S1 (demo)',
    'Sample/demo content for demonstration purposes. Igitabo cy''amasomo cyibanda ku miterere y''interuro n''imikorere y''amazina mu Kinyarwanda kuri Senior 1.',
    'teacher_notes', 'o_level', 'Kinyarwanda', 2024,
    'kinyarwanda', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000006',
    'Chemistry S4 — Practical Exercises (demo)',
    'Sample/demo content for demonstration purposes. Laboratory practical exercises covering acid-base titration, qualitative analysis and reaction rates for Senior 4.',
    'teacher_notes', 'a_level', 'Chemistry', 2024,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000007',
    'Geography — Map Reading Guide O-Level (demo)',
    'Sample/demo content for demonstration purposes. A guide to topographic map interpretation, contour reading, scale, and grid references at the O-Level standard.',
    'educational_guide', 'o_level', 'Geography', 2023,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000008',
    'History of Rwanda — S2 Study Guide (demo)',
    'Sample/demo content for demonstration purposes. Pre-colonial Rwanda, the German and Belgian protectorate periods, and the road to independence — for Senior 2 learners.',
    'educational_guide', 'o_level', 'History', 2024,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-000000000009',
    'ICT Basics — Teacher Notes (demo)',
    'Sample/demo content for demonstration purposes. Introductory notes on computer hardware, software, file management and basic networking suitable for ICT teachers.',
    'teacher_notes', 'o_level', 'ICT', 2024,
    'english', 'published', NOW(), false
  ),
  (
    'd0000001-0000-0000-0000-00000000000a',
    'Entrepreneurship — Senior 5 Sample Notes (demo)',
    'Sample/demo content for demonstration purposes. Notes on business ideas, the business plan, sources of finance and SME management aligned to the Rwanda A-Level Entrepreneurship syllabus.',
    'teacher_notes', 'a_level', 'Entrepreneurship', 2024,
    'english', 'published', NOW(), false
  )
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2. Demo assessments (5) + questions + links
-- ─────────────────────────────────────────────────────────────

-- ── Assessment 1: Mathematics O-Level Practice Quiz (10 MCQ) ──
INSERT INTO public.assessments (
  id, title, description, instructions, level, subject, language,
  duration_minutes, pass_mark, status, published_at
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  'Mathematics O-Level Practice Quiz',
  'Demo content. A 10-question MCQ practice quiz covering core O-Level mathematics topics: arithmetic, algebra, geometry and basic statistics.',
  'Answer all 10 questions. Each question is worth 1 mark. You have 20 minutes.',
  'o_level', 'Mathematics', 'english',
  20, 6, 'published', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (
  id, question_text, type, options, correct_option, marks, order_index,
  level, subject, language, status, difficulty, explanation
) VALUES
  ('a0000001-1000-0000-0000-000000000001',
   'Solve for x:  3x + 7 = 22',
   'mcq',
   '[{"id":"A","text":"x = 3"},{"id":"B","text":"x = 5"},{"id":"C","text":"x = 7"},{"id":"D","text":"x = 15"}]'::jsonb,
   'B', 1, 1, 'o_level', 'Mathematics', 'english', 'published', 'easy',
   'Demo question. 3x = 22 − 7 = 15, so x = 5.'),
  ('a0000001-1000-0000-0000-000000000002',
   'What is the value of  (−4) × (−6) ?',
   'mcq',
   '[{"id":"A","text":"−24"},{"id":"B","text":"−10"},{"id":"C","text":"10"},{"id":"D","text":"24"}]'::jsonb,
   'D', 1, 2, 'o_level', 'Mathematics', 'english', 'published', 'easy',
   'Demo question. The product of two negative numbers is positive: 4 × 6 = 24.'),
  ('a0000001-1000-0000-0000-000000000003',
   'The sum of interior angles of a triangle is:',
   'mcq',
   '[{"id":"A","text":"90°"},{"id":"B","text":"180°"},{"id":"C","text":"270°"},{"id":"D","text":"360°"}]'::jsonb,
   'B', 1, 3, 'o_level', 'Mathematics', 'english', 'published', 'easy',
   'Demo question. The interior angles of any triangle always sum to 180°.'),
  ('a0000001-1000-0000-0000-000000000004',
   'Simplify:  2(3x − 4) + 5x',
   'mcq',
   '[{"id":"A","text":"6x − 4"},{"id":"B","text":"11x − 8"},{"id":"C","text":"11x − 4"},{"id":"D","text":"6x − 8"}]'::jsonb,
   'B', 1, 4, 'o_level', 'Mathematics', 'english', 'published', 'medium',
   'Demo question. 2(3x − 4) = 6x − 8, then add 5x → 11x − 8.'),
  ('a0000001-1000-0000-0000-000000000005',
   'A rectangle has length 8 cm and width 5 cm. Its area is:',
   'mcq',
   '[{"id":"A","text":"13 cm²"},{"id":"B","text":"26 cm²"},{"id":"C","text":"40 cm²"},{"id":"D","text":"80 cm²"}]'::jsonb,
   'C', 1, 5, 'o_level', 'Mathematics', 'english', 'published', 'easy',
   'Demo question. Area = length × width = 8 × 5 = 40 cm².'),
  ('a0000001-1000-0000-0000-000000000006',
   'Express 0.25 as a fraction in its lowest terms.',
   'mcq',
   '[{"id":"A","text":"1/2"},{"id":"B","text":"1/4"},{"id":"C","text":"1/5"},{"id":"D","text":"2/5"}]'::jsonb,
   'B', 1, 6, 'o_level', 'Mathematics', 'english', 'published', 'easy',
   'Demo question. 0.25 = 25/100 = 1/4.'),
  ('a0000001-1000-0000-0000-000000000007',
   'If sin θ = 0.5 and θ is acute, then θ equals:',
   'mcq',
   '[{"id":"A","text":"30°"},{"id":"B","text":"45°"},{"id":"C","text":"60°"},{"id":"D","text":"90°"}]'::jsonb,
   'A', 1, 7, 'o_level', 'Mathematics', 'english', 'published', 'medium',
   'Demo question. sin 30° = 0.5 (a standard exact value).'),
  ('a0000001-1000-0000-0000-000000000008',
   'The mean of  4, 6, 8, 10, 12  is:',
   'mcq',
   '[{"id":"A","text":"6"},{"id":"B","text":"7"},{"id":"C","text":"8"},{"id":"D","text":"10"}]'::jsonb,
   'C', 1, 8, 'o_level', 'Mathematics', 'english', 'published', 'easy',
   'Demo question. (4+6+8+10+12)/5 = 40/5 = 8.'),
  ('a0000001-1000-0000-0000-000000000009',
   'Factorise:  x² − 9',
   'mcq',
   '[{"id":"A","text":"(x − 3)(x − 3)"},{"id":"B","text":"(x − 3)(x + 3)"},{"id":"C","text":"(x − 9)(x + 1)"},{"id":"D","text":"(x + 3)(x + 3)"}]'::jsonb,
   'B', 1, 9, 'o_level', 'Mathematics', 'english', 'published', 'medium',
   'Demo question. Difference of two squares: a² − b² = (a − b)(a + b).'),
  ('a0000001-1000-0000-0000-00000000000a',
   'Solve the inequality:  2x − 3 > 5',
   'mcq',
   '[{"id":"A","text":"x > 1"},{"id":"B","text":"x > 4"},{"id":"C","text":"x < 4"},{"id":"D","text":"x > 8"}]'::jsonb,
   'B', 1, 10, 'o_level', 'Mathematics', 'english', 'published', 'medium',
   'Demo question. 2x > 8, therefore x > 4.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (assessment_id, question_id, order_index) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000001', 1),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000002', 2),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000003', 3),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000004', 4),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000005', 5),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000006', 6),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000007', 7),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000008', 8),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-000000000009', 9),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-1000-0000-0000-00000000000a', 10)
ON CONFLICT (assessment_id, question_id) DO NOTHING;


-- ── Assessment 2: Biology S3 — Cell Structure Quiz (8 MCQ) ──
INSERT INTO public.assessments (
  id, title, description, instructions, level, subject, language,
  duration_minutes, pass_mark, status, published_at
) VALUES (
  'a0000002-0000-0000-0000-000000000001',
  'Biology S3 — Cell Structure Quiz',
  'Demo content. An 8-question quiz on plant and animal cells, organelles and their functions for Senior 3 Biology learners.',
  'Answer all 8 questions. Each question is worth 1 mark. You have 15 minutes.',
  'o_level', 'Biology', 'english',
  15, 5, 'published', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (
  id, question_text, type, options, correct_option, marks, order_index,
  level, subject, language, status, difficulty, explanation
) VALUES
  ('a0000002-1000-0000-0000-000000000001',
   'Which organelle is known as the "powerhouse of the cell"?',
   'mcq',
   '[{"id":"A","text":"Nucleus"},{"id":"B","text":"Ribosome"},{"id":"C","text":"Mitochondrion"},{"id":"D","text":"Golgi apparatus"}]'::jsonb,
   'C', 1, 1, 'o_level', 'Biology', 'english', 'published', 'easy',
   'Demo question. Mitochondria produce ATP via cellular respiration — the cell''s main energy source.'),
  ('a0000002-1000-0000-0000-000000000002',
   'Which structure is found in plant cells but NOT in animal cells?',
   'mcq',
   '[{"id":"A","text":"Cell membrane"},{"id":"B","text":"Cell wall"},{"id":"C","text":"Nucleus"},{"id":"D","text":"Mitochondria"}]'::jsonb,
   'B', 1, 2, 'o_level', 'Biology', 'english', 'published', 'easy',
   'Demo question. The cell wall (made of cellulose) is a defining feature of plant cells.'),
  ('a0000002-1000-0000-0000-000000000003',
   'The site of protein synthesis in a cell is the:',
   'mcq',
   '[{"id":"A","text":"Lysosome"},{"id":"B","text":"Ribosome"},{"id":"C","text":"Vacuole"},{"id":"D","text":"Centriole"}]'::jsonb,
   'B', 1, 3, 'o_level', 'Biology', 'english', 'published', 'easy',
   'Demo question. Ribosomes translate mRNA into polypeptides.'),
  ('a0000002-1000-0000-0000-000000000004',
   'Chloroplasts contain which pigment that absorbs light for photosynthesis?',
   'mcq',
   '[{"id":"A","text":"Haemoglobin"},{"id":"B","text":"Melanin"},{"id":"C","text":"Chlorophyll"},{"id":"D","text":"Carotene only"}]'::jsonb,
   'C', 1, 4, 'o_level', 'Biology', 'english', 'published', 'easy',
   'Demo question. Chlorophyll is the primary photosynthetic pigment, giving plants their green colour.'),
  ('a0000002-1000-0000-0000-000000000005',
   'Which process do cells use to take in large particles by engulfing them?',
   'mcq',
   '[{"id":"A","text":"Diffusion"},{"id":"B","text":"Osmosis"},{"id":"C","text":"Phagocytosis"},{"id":"D","text":"Active transport"}]'::jsonb,
   'C', 1, 5, 'o_level', 'Biology', 'english', 'published', 'medium',
   'Demo question. Phagocytosis is a form of endocytosis used to engulf solid particles.'),
  ('a0000002-1000-0000-0000-000000000006',
   'Genetic material in eukaryotic cells is stored mainly in the:',
   'mcq',
   '[{"id":"A","text":"Cytoplasm"},{"id":"B","text":"Nucleus"},{"id":"C","text":"Cell membrane"},{"id":"D","text":"Ribosomes"}]'::jsonb,
   'B', 1, 6, 'o_level', 'Biology', 'english', 'published', 'easy',
   'Demo question. The nucleus holds the cell''s DNA organised into chromosomes.'),
  ('a0000002-1000-0000-0000-000000000007',
   'During mitosis, a parent cell divides into how many daughter cells?',
   'mcq',
   '[{"id":"A","text":"1"},{"id":"B","text":"2"},{"id":"C","text":"4"},{"id":"D","text":"8"}]'::jsonb,
   'B', 1, 7, 'o_level', 'Biology', 'english', 'published', 'easy',
   'Demo question. Mitosis produces two genetically identical daughter cells.'),
  ('a0000002-1000-0000-0000-000000000008',
   'Which organelle modifies, packages and sorts proteins for secretion?',
   'mcq',
   '[{"id":"A","text":"Smooth ER"},{"id":"B","text":"Golgi apparatus"},{"id":"C","text":"Lysosome"},{"id":"D","text":"Nucleolus"}]'::jsonb,
   'B', 1, 8, 'o_level', 'Biology', 'english', 'published', 'medium',
   'Demo question. The Golgi apparatus modifies proteins and packages them into vesicles.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (assessment_id, question_id, order_index) VALUES
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000001', 1),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000002', 2),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000003', 3),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000004', 4),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000005', 5),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000006', 6),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000007', 7),
  ('a0000002-0000-0000-0000-000000000001', 'a0000002-1000-0000-0000-000000000008', 8)
ON CONFLICT (assessment_id, question_id) DO NOTHING;


-- ── Assessment 3: English Grammar Practice (10 MCQ) ──
INSERT INTO public.assessments (
  id, title, description, instructions, level, subject, language,
  duration_minutes, pass_mark, status, published_at
) VALUES (
  'a0000003-0000-0000-0000-000000000001',
  'English Grammar Practice',
  'Demo content. A 10-question grammar quiz covering tenses, articles, prepositions and basic sentence construction.',
  'Answer all 10 questions. Each question is worth 1 mark. You have 15 minutes.',
  'o_level', 'English', 'english',
  15, 6, 'published', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (
  id, question_text, type, options, correct_option, marks, order_index,
  level, subject, language, status, difficulty, explanation
) VALUES
  ('a0000003-1000-0000-0000-000000000001',
   'Choose the correct form:  She _____ to school every morning.',
   'mcq',
   '[{"id":"A","text":"go"},{"id":"B","text":"goes"},{"id":"C","text":"going"},{"id":"D","text":"gone"}]'::jsonb,
   'B', 1, 1, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. Third-person singular in the simple present takes -s/-es.'),
  ('a0000003-1000-0000-0000-000000000002',
   'Which word is a PRONOUN?',
   'mcq',
   '[{"id":"A","text":"quickly"},{"id":"B","text":"they"},{"id":"C","text":"happy"},{"id":"D","text":"run"}]'::jsonb,
   'B', 1, 2, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. "They" is a personal pronoun replacing a plural noun.'),
  ('a0000003-1000-0000-0000-000000000003',
   'Pick the correct article:  Kigali is _____ capital of Rwanda.',
   'mcq',
   '[{"id":"A","text":"a"},{"id":"B","text":"an"},{"id":"C","text":"the"},{"id":"D","text":"no article"}]'::jsonb,
   'C', 1, 3, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. "The" is used with unique entities like capital cities.'),
  ('a0000003-1000-0000-0000-000000000004',
   'Identify the past tense of  "write":',
   'mcq',
   '[{"id":"A","text":"writed"},{"id":"B","text":"wroten"},{"id":"C","text":"wrote"},{"id":"D","text":"writing"}]'::jsonb,
   'C', 1, 4, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. "Write" is irregular: write — wrote — written.'),
  ('a0000003-1000-0000-0000-000000000005',
   'Which sentence is grammatically correct?',
   'mcq',
   '[{"id":"A","text":"He don''t like rice."},{"id":"B","text":"He doesn''t likes rice."},{"id":"C","text":"He doesn''t like rice."},{"id":"D","text":"He not like rice."}]'::jsonb,
   'C', 1, 5, 'o_level', 'English', 'english', 'published', 'medium',
   'Demo question. With "doesn''t" the main verb stays in its base form.'),
  ('a0000003-1000-0000-0000-000000000006',
   'The opposite of  "ancient"  is:',
   'mcq',
   '[{"id":"A","text":"old"},{"id":"B","text":"modern"},{"id":"C","text":"historic"},{"id":"D","text":"ruined"}]'::jsonb,
   'B', 1, 6, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. "Ancient" means very old; its antonym is "modern".'),
  ('a0000003-1000-0000-0000-000000000007',
   'Choose the correct preposition:  The book is _____ the table.',
   'mcq',
   '[{"id":"A","text":"in"},{"id":"B","text":"on"},{"id":"C","text":"at"},{"id":"D","text":"of"}]'::jsonb,
   'B', 1, 7, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. "On" indicates contact with a surface.'),
  ('a0000003-1000-0000-0000-000000000008',
   'Which word is an ADVERB?',
   'mcq',
   '[{"id":"A","text":"beautiful"},{"id":"B","text":"beautifully"},{"id":"C","text":"beauty"},{"id":"D","text":"beautify"}]'::jsonb,
   'B', 1, 8, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. The -ly suffix turns the adjective "beautiful" into an adverb.'),
  ('a0000003-1000-0000-0000-000000000009',
   'Choose the correct plural:  one  child  →  many _____',
   'mcq',
   '[{"id":"A","text":"childs"},{"id":"B","text":"childen"},{"id":"C","text":"children"},{"id":"D","text":"childes"}]'::jsonb,
   'C', 1, 9, 'o_level', 'English', 'english', 'published', 'easy',
   'Demo question. "Children" is an irregular plural.'),
  ('a0000003-1000-0000-0000-00000000000a',
   'Pick the correct passive voice of:  "The teacher marks the books."',
   'mcq',
   '[{"id":"A","text":"The books are marked by the teacher."},{"id":"B","text":"The books were marked by the teacher."},{"id":"C","text":"The books mark the teacher."},{"id":"D","text":"The books being marked by the teacher."}]'::jsonb,
   'A', 1, 10, 'o_level', 'English', 'english', 'published', 'medium',
   'Demo question. Present-simple passive: object + am/is/are + past participle (+ by + subject).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (assessment_id, question_id, order_index) VALUES
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000001', 1),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000002', 2),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000003', 3),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000004', 4),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000005', 5),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000006', 6),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000007', 7),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000008', 8),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-000000000009', 9),
  ('a0000003-0000-0000-0000-000000000001', 'a0000003-1000-0000-0000-00000000000a', 10)
ON CONFLICT (assessment_id, question_id) DO NOTHING;


-- ── Assessment 4: History of Rwanda Practice Set (8 MCQ) ──
INSERT INTO public.assessments (
  id, title, description, instructions, level, subject, language,
  duration_minutes, pass_mark, status, published_at
) VALUES (
  'a0000004-0000-0000-0000-000000000001',
  'History of Rwanda Practice Set',
  'Demo content. An 8-question practice set covering key events, dates and figures in Rwandan history from the pre-colonial era to independence.',
  'Answer all 8 questions. Each question is worth 1 mark. You have 15 minutes.',
  'o_level', 'History', 'english',
  15, 5, 'published', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (
  id, question_text, type, options, correct_option, marks, order_index,
  level, subject, language, status, difficulty, explanation
) VALUES
  ('a0000004-1000-0000-0000-000000000001',
   'In which year did Rwanda gain independence?',
   'mcq',
   '[{"id":"A","text":"1960"},{"id":"B","text":"1962"},{"id":"C","text":"1965"},{"id":"D","text":"1973"}]'::jsonb,
   'B', 1, 1, 'o_level', 'History', 'english', 'published', 'easy',
   'Demo question. Rwanda gained independence on 1 July 1962.'),
  ('a0000004-1000-0000-0000-000000000002',
   'Which European country administered Rwanda as a League of Nations / UN mandate before independence?',
   'mcq',
   '[{"id":"A","text":"Germany"},{"id":"B","text":"Britain"},{"id":"C","text":"Belgium"},{"id":"D","text":"France"}]'::jsonb,
   'C', 1, 2, 'o_level', 'History', 'english', 'published', 'easy',
   'Demo question. After WWI Belgium took over from Germany; the territory was Ruanda-Urundi.'),
  ('a0000004-1000-0000-0000-000000000003',
   'The pre-colonial kingdom of Rwanda was led by a king known as the:',
   'mcq',
   '[{"id":"A","text":"Mwami"},{"id":"B","text":"Bwana"},{"id":"C","text":"Sultan"},{"id":"D","text":"Sheikh"}]'::jsonb,
   'A', 1, 3, 'o_level', 'History', 'english', 'published', 'easy',
   'Demo question. "Mwami" is the Kinyarwanda title for the king.'),
  ('a0000004-1000-0000-0000-000000000004',
   'The 1994 Genocide against the Tutsi is officially commemorated each year beginning on:',
   'mcq',
   '[{"id":"A","text":"7 April"},{"id":"B","text":"1 July"},{"id":"C","text":"4 July"},{"id":"D","text":"15 December"}]'::jsonb,
   'A', 1, 4, 'o_level', 'History', 'english', 'published', 'easy',
   'Demo question. Kwibuka begins on 7 April and runs for 100 days.'),
  ('a0000004-1000-0000-0000-000000000005',
   'Which traditional Rwandan institution refers to the country''s pre-colonial system of cattle-based clientship?',
   'mcq',
   '[{"id":"A","text":"Ubuhake"},{"id":"B","text":"Umuganda"},{"id":"C","text":"Gacaca"},{"id":"D","text":"Itorero"}]'::jsonb,
   'A', 1, 5, 'o_level', 'History', 'english', 'published', 'medium',
   'Demo question. Ubuhake was a patron-client relationship organised around cattle ownership.'),
  ('a0000004-1000-0000-0000-000000000006',
   'Liberation Day in Rwanda, marking the end of the Genocide against the Tutsi, falls on:',
   'mcq',
   '[{"id":"A","text":"1 January"},{"id":"B","text":"7 April"},{"id":"C","text":"1 July"},{"id":"D","text":"4 July"}]'::jsonb,
   'D', 1, 6, 'o_level', 'History', 'english', 'published', 'easy',
   'Demo question. 4 July 1994 is observed as Liberation Day (Kwibohora).'),
  ('a0000004-1000-0000-0000-000000000007',
   'Which community-based justice system was used after 1994 to try lower-level genocide cases?',
   'mcq',
   '[{"id":"A","text":"Gacaca courts"},{"id":"B","text":"Inyangamugayo"},{"id":"C","text":"ICTR only"},{"id":"D","text":"Supreme Court"}]'::jsonb,
   'A', 1, 7, 'o_level', 'History', 'english', 'published', 'medium',
   'Demo question. Gacaca courts were community courts revived to handle the backlog of genocide cases.'),
  ('a0000004-1000-0000-0000-000000000008',
   'Who was the first president of independent Rwanda (1962–1973)?',
   'mcq',
   '[{"id":"A","text":"Juvénal Habyarimana"},{"id":"B","text":"Grégoire Kayibanda"},{"id":"C","text":"Pasteur Bizimungu"},{"id":"D","text":"Paul Kagame"}]'::jsonb,
   'B', 1, 8, 'o_level', 'History', 'english', 'published', 'medium',
   'Demo question. Grégoire Kayibanda served as Rwanda''s first president from 1962 until 1973.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (assessment_id, question_id, order_index) VALUES
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000001', 1),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000002', 2),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000003', 3),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000004', 4),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000005', 5),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000006', 6),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000007', 7),
  ('a0000004-0000-0000-0000-000000000001', 'a0000004-1000-0000-0000-000000000008', 8)
ON CONFLICT (assessment_id, question_id) DO NOTHING;


-- ── Assessment 5: ICT Basics Quiz (8 MCQ) ──
INSERT INTO public.assessments (
  id, title, description, instructions, level, subject, language,
  duration_minutes, pass_mark, status, published_at
) VALUES (
  'a0000005-0000-0000-0000-000000000001',
  'ICT Basics Quiz',
  'Demo content. An 8-question quiz on computer hardware, software, file management and basic internet concepts at the O-Level standard.',
  'Answer all 8 questions. Each question is worth 1 mark. You have 12 minutes.',
  'o_level', 'ICT', 'english',
  12, 5, 'published', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (
  id, question_text, type, options, correct_option, marks, order_index,
  level, subject, language, status, difficulty, explanation
) VALUES
  ('a0000005-1000-0000-0000-000000000001',
   'What does "CPU" stand for?',
   'mcq',
   '[{"id":"A","text":"Central Processing Unit"},{"id":"B","text":"Computer Personal Unit"},{"id":"C","text":"Central Programming Unit"},{"id":"D","text":"Control Process Utility"}]'::jsonb,
   'A', 1, 1, 'o_level', 'ICT', 'english', 'published', 'easy',
   'Demo question. The CPU (Central Processing Unit) executes instructions in a computer.'),
  ('a0000005-1000-0000-0000-000000000002',
   'Which of the following is an INPUT device?',
   'mcq',
   '[{"id":"A","text":"Monitor"},{"id":"B","text":"Printer"},{"id":"C","text":"Keyboard"},{"id":"D","text":"Speaker"}]'::jsonb,
   'C', 1, 2, 'o_level', 'ICT', 'english', 'published', 'easy',
   'Demo question. A keyboard inputs data; the others all output data.'),
  ('a0000005-1000-0000-0000-000000000003',
   'RAM is best described as:',
   'mcq',
   '[{"id":"A","text":"Permanent storage"},{"id":"B","text":"Volatile working memory"},{"id":"C","text":"A network protocol"},{"id":"D","text":"An input device"}]'::jsonb,
   'B', 1, 3, 'o_level', 'ICT', 'english', 'published', 'medium',
   'Demo question. RAM is volatile — its contents are lost when power is removed.'),
  ('a0000005-1000-0000-0000-000000000004',
   'Which file extension is typically used for a Microsoft Word document?',
   'mcq',
   '[{"id":"A","text":".xlsx"},{"id":"B","text":".pptx"},{"id":"C","text":".docx"},{"id":"D","text":".mp3"}]'::jsonb,
   'C', 1, 4, 'o_level', 'ICT', 'english', 'published', 'easy',
   'Demo question. .docx is the modern Word document format.'),
  ('a0000005-1000-0000-0000-000000000005',
   'Which of the following is an example of an operating system?',
   'mcq',
   '[{"id":"A","text":"Microsoft Word"},{"id":"B","text":"Google Chrome"},{"id":"C","text":"Windows 11"},{"id":"D","text":"Excel"}]'::jsonb,
   'C', 1, 5, 'o_level', 'ICT', 'english', 'published', 'easy',
   'Demo question. Windows 11 is an operating system; the others are application software.'),
  ('a0000005-1000-0000-0000-000000000006',
   '1 kilobyte (KB) is equal to:',
   'mcq',
   '[{"id":"A","text":"1 byte"},{"id":"B","text":"1 024 bytes"},{"id":"C","text":"1 000 000 bytes"},{"id":"D","text":"1 000 megabytes"}]'::jsonb,
   'B', 1, 6, 'o_level', 'ICT', 'english', 'published', 'medium',
   'Demo question. In binary terms 1 KB = 1024 bytes (some standards use 1000).'),
  ('a0000005-1000-0000-0000-000000000007',
   'A network covering a single building or campus is called:',
   'mcq',
   '[{"id":"A","text":"WAN"},{"id":"B","text":"LAN"},{"id":"C","text":"MAN"},{"id":"D","text":"VPN"}]'::jsonb,
   'B', 1, 7, 'o_level', 'ICT', 'english', 'published', 'easy',
   'Demo question. A LAN (Local Area Network) covers a limited area such as a building.'),
  ('a0000005-1000-0000-0000-000000000008',
   'Which of these is a strong password practice?',
   'mcq',
   '[{"id":"A","text":"Using your name and year of birth"},{"id":"B","text":"Reusing the same password everywhere"},{"id":"C","text":"Mixing letters, numbers and symbols, unique per site"},{"id":"D","text":"Writing it on the desk"}]'::jsonb,
   'C', 1, 8, 'o_level', 'ICT', 'english', 'published', 'easy',
   'Demo question. Strong passwords are long, varied, and unique per service.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (assessment_id, question_id, order_index) VALUES
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000001', 1),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000002', 2),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000003', 3),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000004', 4),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000005', 5),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000006', 6),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000007', 7),
  ('a0000005-0000-0000-0000-000000000001', 'a0000005-1000-0000-0000-000000000008', 8)
ON CONFLICT (assessment_id, question_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Done. Demo content seeded.
-- ─────────────────────────────────────────────────────────────
