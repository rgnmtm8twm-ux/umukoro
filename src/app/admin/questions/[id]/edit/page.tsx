import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuestionForm } from '@/components/admin/QuestionForm'
import Link from 'next/link'
import {
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_COLORS,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  type Question,
} from '@/types'

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: question, error } = await db
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !question) notFound()

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/questions"
          className="mb-3 flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Question Bank
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#0F172A]">Edit Question</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">
              {QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS] ?? question.type}
              {question.difficulty && ` · ${DIFFICULTY_LABELS[question.difficulty as keyof typeof DIFFICULTY_LABELS] ?? question.difficulty}`}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUESTION_STATUS_COLORS[question.status as keyof typeof QUESTION_STATUS_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
              {QUESTION_STATUS_LABELS[question.status as keyof typeof QUESTION_STATUS_LABELS] ?? question.status}
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">ID: {id}</p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <QuestionForm question={question as Question} />
      </div>
    </div>
  )
}
