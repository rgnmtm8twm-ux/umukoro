// ─────────────────────────────────────────────────────────────
// Umukoro — Application types (shared base + assessment engine)
// ─────────────────────────────────────────────────────────────

// ─── Enums / Literals ────────────────────────────────────────

export type ResourceStatus =
  | 'draft'
  | 'pending_review'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived'

export type ResourceType =
  | 'past_paper'
  | 'marking_scheme'
  | 'syllabus'
  | 'teacher_notes'
  | 'book'
  | 'curriculum'
  | 'educational_guide'

export type EducationLevel = 'primary' | 'o_level' | 'a_level' | 'tvet'

export type ResourceLanguage = 'english' | 'french' | 'kinyarwanda' | 'bilingual'

export type ContributorType =
  | 'teacher'
  | 'school'
  | 'institution'
  | 'educational_org'
  | 'individual'

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

// ─── A-Level Combinations (Rwanda) ───────────────────────────

export const A_LEVEL_COMBINATIONS = [
  'MCB — Mathematics, Chemistry, Biology',
  'MPC — Mathematics, Physics, Chemistry',
  'MPG — Mathematics, Physics, Geography',
  'MEG — Mathematics, Economics, Geography',
  'PCB — Physics, Chemistry, Biology',
  'PCM — Physics, Chemistry, Mathematics',
  'HEG — History, Economics, Geography',
  'HGL — History, Geography, Literature',
  'MEL — Mathematics, Economics, Literature',
  'CEL — Computer Science, Economics, Literature',
  'CME — Computer Science, Mathematics, Economics',
  'Other',
] as const

export type ALevelCombination = (typeof A_LEVEL_COMBINATIONS)[number]

// ─── Resource ─────────────────────────────────────────────────

export interface Resource {
  id: string
  title: string
  description: string | null
  resource_type: ResourceType
  level: EducationLevel
  subject: string | null
  topic: string | null
  combination: string | null
  language: ResourceLanguage
  tags: string[]
  year: number | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  status: ResourceStatus
  is_official: boolean
  source_institution: string | null
  download_count: number
  view_count: number
  uploaded_by: string | null
  reviewed_by: string | null
  moderator_id: string | null
  rejection_reason: string | null
  moderation_notes: string | null
  moderation_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// Lightweight version for list views
export type ResourceSummary = Pick<
  Resource,
  | 'id'
  | 'title'
  | 'description'
  | 'resource_type'
  | 'level'
  | 'subject'
  | 'topic'
  | 'combination'
  | 'language'
  | 'year'
  | 'file_name'
  | 'status'
  | 'is_official'
  | 'download_count'
  | 'view_count'
  | 'published_at'
  | 'created_at'
  | 'tags'
>

// ─── Contributor Profile ──────────────────────────────────────

export interface ContributorProfile {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  institution_name: string | null
  institution_type: string | null
  location: string | null
  website_url: string | null
  subject_specialties: string[]
  contributor_type: ContributorType
  verification_status: VerificationStatus
  verified_at: string | null
  verified_by: string | null
  verification_notes: string | null
  published_count: number
  created_at: string
  updated_at: string
}

// ─── Contributor Application ──────────────────────────────────

export interface ContributorApplication {
  id: string
  user_id: string
  motivation: string | null
  school_or_org: string | null
  subject_expertise: string[] | null
  status: string
  reviewer_id: string | null
  reviewed_at: string | null
  created_at: string
}

// ─── Topic ────────────────────────────────────────────────────

export interface Topic {
  id: string
  name: string
  slug: string
  subject: string | null
  level: EducationLevel | null
  created_at: string
}

// ─── Profile ──────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  is_contributor: boolean
  role: 'admin' | 'contributor' | 'reviewer'
  created_at: string
}

// ─── Display label maps (shared across UI) ───────────────────

export const LEVEL_LABELS: Record<EducationLevel, string> = {
  primary: "Primary (P1–P6)",
  o_level: "O'Level (S1–S3)",
  a_level: "A'Level (S4–S6)",
  tvet: 'TVET / Vocational',
}

export const TYPE_LABELS: Record<ResourceType, string> = {
  past_paper: 'Past Paper',
  marking_scheme: 'Marking Scheme',
  syllabus: 'Syllabus',
  teacher_notes: 'Teacher Notes',
  book: 'Book / Guide',
  curriculum: 'Curriculum Material',
  educational_guide: 'Educational Guide',
}

export const TYPE_COLORS: Record<ResourceType, string> = {
  past_paper: 'bg-[#EAF0F8] text-[#27438A]',
  marking_scheme: 'bg-[#E6F4F2] text-[#0A7068]',
  syllabus: 'bg-[#FFF7ED] text-[#92400E]',
  teacher_notes: 'bg-[#F5F3FF] text-[#5B21B6]',
  book: 'bg-[#FDF2F8] text-[#9D174D]',
  curriculum: 'bg-[#F1F5F9] text-[#64748B]',
  educational_guide: 'bg-[#ECFDF5] text-[#065F46]',
}

export const LEVEL_COLORS: Record<EducationLevel, string> = {
  primary: 'bg-emerald-50 text-emerald-700',
  o_level: 'bg-blue-50 text-blue-700',
  a_level: 'bg-indigo-50 text-indigo-700',
  tvet: 'bg-amber-50 text-amber-700',
}

export const LANGUAGE_LABELS: Record<ResourceLanguage, string> = {
  english: 'English',
  french: 'French',
  kinyarwanda: 'Kinyarwanda',
  bilingual: 'Bilingual',
}

export const STATUS_LABELS: Record<ResourceStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
  archived: 'Archived',
}

export const STATUS_COLORS: Record<ResourceStatus, string> = {
  draft: 'bg-[#F1F5F9] text-[#64748B]',
  pending_review: 'bg-amber-50 text-amber-700',
  review: 'bg-amber-50 text-amber-600',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-[#F1F5F9] text-[#94A3B8]',
}

// ─── Subjects by level ────────────────────────────────────────

export const SUBJECTS_BY_LEVEL: Record<EducationLevel, string[]> = {
  primary: [
    'Mathematics',
    'English',
    'Kinyarwanda',
    'Science & Elementary Technology',
    'Social Studies',
    'French',
    'Religious Education',
  ],
  o_level: [
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Computer Science',
    'French',
    'Kinyarwanda',
    'Religious Education',
    'Entrepreneurship',
  ],
  a_level: [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Computer Science',
    'English',
    'French',
    'Entrepreneurship',
    'General Studies',
  ],
  tvet: [
    'General',
    'Construction Technology',
    'ICT',
    'Agriculture',
    'Hospitality & Tourism',
    'Automotive Technology',
    'Electricity',
    'Plumbing',
  ],
}

// ═════════════════════════════════════════════════════════════
// UMUKORO — Assessment Engine Types
// ═════════════════════════════════════════════════════════════

// ─── Question types & status ─────────────────────────────────

export type QuestionType =
  | 'mcq'        // Multiple choice — single correct option
  | 'true_false' // Two-option boolean question
  | 'short'      // Short answer — manual or keyword marking
  | 'long'       // Long answer / essay — manual marking
  | 'math'       // Mathematical — manual marking
  | 'written'    // Extended written response

export type QuestionStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived'

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export type AssessmentStatus = 'draft' | 'published' | 'archived'

// ─── Question interface ───────────────────────────────────────

export interface QuestionOption {
  id: string          // e.g. 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface Question {
  id: string
  question_text: string
  type: QuestionType
  difficulty: QuestionDifficulty
  options: QuestionOption[] | null   // MCQ / TF only
  correct_option: string | null       // MCQ / TF — option id
  correct_answer: string | null       // Short / keyword answer
  explanation: string | null          // Shown after submission
  marks: number
  level: EducationLevel | null
  subject: string | null
  language: ResourceLanguage
  tags: string[]
  source_resource_id: string | null
  status: QuestionStatus
  created_by: string | null
  paper_id: string | null             // Legacy — existing paper questions
  order_index: number
  created_at: string
  updated_at: string
}

// Lightweight version for lists / question picker
export type QuestionSummary = Pick<Question,
  | 'id'
  | 'question_text'
  | 'type'
  | 'difficulty'
  | 'marks'
  | 'level'
  | 'subject'
  | 'language'
  | 'status'
  | 'tags'
  | 'created_at'
>

// ─── Assessment interface ─────────────────────────────────────

export interface Assessment {
  id: string
  title: string
  description: string | null
  instructions: string | null
  level: EducationLevel | null
  subject: string | null
  combination: string | null
  language: ResourceLanguage
  duration_minutes: number | null
  total_marks: number
  pass_mark: number | null
  shuffle_questions: boolean
  show_results: boolean
  allow_review: boolean
  max_attempts: number | null
  status: AssessmentStatus
  created_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined
  question_count?: number
}

// ─── Assessment Question join ─────────────────────────────────

export interface AssessmentQuestion {
  id: string
  assessment_id: string
  question_id: string
  order_index: number
  marks_override: number | null
  created_at: string
  // Joined
  question?: Question
}

// ─── Attempt interface ────────────────────────────────────────

export interface Attempt {
  id: string
  user_id: string
  assessment_id: string | null
  paper_id: string | null
  is_complete: boolean
  auto_score: number | null
  self_score: number | null
  total_marks: number | null
  score_percentage: number | null
  time_taken_seconds: number | null
  started_at: string
  submitted_at: string | null
  created_at: string
  updated_at: string
  // Joined
  assessment?: Pick<Assessment, 'id' | 'title' | 'level' | 'subject' | 'pass_mark' | 'allow_review' | 'show_results'>
}

// ─── Attempt Answer interface ─────────────────────────────────

export interface AttemptAnswer {
  id: string
  attempt_id: string
  question_id: string
  selected_option: string | null
  answer_text: string | null
  is_correct: boolean | null
  auto_marks: number | null
  self_marks: number | null
  created_at: string
  // Joined
  question?: Question
}

// ─── Umukoro display maps ─────────────────────────────────────

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq:        'Multiple Choice',
  true_false: 'True / False',
  short:      'Short Answer',
  long:       'Long Answer',
  math:       'Mathematics',
  written:    'Written Response',
}

export const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  mcq:        'bg-[#EFF6FF] text-[#3457A6]',
  true_false: 'bg-[#ECFDF5] text-[#065F46]',
  short:      'bg-[#FFF7ED] text-[#92400E]',
  long:       'bg-[#F5F3FF] text-[#5B21B6]',
  math:       'bg-[#FDF2F8] text-[#9D174D]',
  written:    'bg-[#F1F5F9] text-[#475569]',
}

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  draft:          'Draft',
  pending_review: 'Pending Review',
  published:      'Published',
  rejected:       'Rejected',
  archived:       'Archived',
}

export const QUESTION_STATUS_COLORS: Record<QuestionStatus, string> = {
  draft:          'bg-[#F1F5F9] text-[#64748B]',
  pending_review: 'bg-amber-50 text-amber-700',
  published:      'bg-emerald-50 text-emerald-700',
  rejected:       'bg-red-50 text-red-700',
  archived:       'bg-[#F1F5F9] text-[#94A3B8]',
}

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
}

export const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-red-50 text-red-700',
}

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft:     'Draft',
  published: 'Published',
  archived:  'Archived',
}

export const ASSESSMENT_STATUS_COLORS: Record<AssessmentStatus, string> = {
  draft:     'bg-[#F1F5F9] text-[#64748B]',
  published: 'bg-emerald-50 text-emerald-700',
  archived:  'bg-[#F1F5F9] text-[#94A3B8]',
}

// Auto-markable question types
export const AUTO_MARK_TYPES: QuestionType[] = ['mcq', 'true_false']

// True/False option set (reusable)
export const TRUE_FALSE_OPTIONS: QuestionOption[] = [
  { id: 'true',  text: 'True'  },
  { id: 'false', text: 'False' },
]
