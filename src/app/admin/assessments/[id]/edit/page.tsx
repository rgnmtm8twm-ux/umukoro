import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AssessmentForm } from '@/components/admin/AssessmentForm'
import { QuestionPicker } from '@/components/admin/QuestionPicker'
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_STATUS_COLORS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_COLORS,
  DIFFICULTY_LABELS,
  type Assessment,
  type Question,
} from '@/types'
import {
  removeQuestionFromAssessment,
  publishAssessment,
} from '@/actions/umukoro'

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Load assessment
  const { data: assessment, error } = await db
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !assessment) notFound()

  // Load assessment questions (with question details)
  const { data: aqRows } = await db
    .from('assessment_questions')
    .select('id, order_index, marks_override, question:questions(id, question_text, type, difficulty, marks, level, subject)')
    .eq('assessment_id', id)
    .order('order_index', { ascending: true })

  // Load available questions (not already in assessment)
  const existingIds: string[] = (aqRows ?? []).map((r: { question: { id: string } }) => r.question?.id).filter(Boolean)

  const { data: availableQuestions } = await db
    .from('questions')
    .select('id, question_text, type, difficulty, marks, level, subject, tags')
    .is('paper_id', null)
    .eq('status', 'published')
    .not('id', 'in', existingIds.length > 0 ? `(${existingIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalMarks = (aqRows ?? []).reduce((sum: number, r: { marks_override: number | null; question: Question }) => {
    return sum + (r.marks_override ?? r.question?.marks ?? 0)
  }, 0)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/assessments"
            className="mb-2 flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Assessments
          </Link>
          <h1 className="text-xl font-semibold text-[#0F172A]">{assessment.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ASSESSMENT_STATUS_COLORS[assessment.status as keyof typeof ASSESSMENT_STATUS_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
              {ASSESSMENT_STATUS_LABELS[assessment.status as keyof typeof ASSESSMENT_STATUS_LABELS] ?? assessment.status}
            </span>
            <span className="text-xs text-[#94A3B8]">
              {(aqRows ?? []).length} question{(aqRows ?? []).length !== 1 ? 's' : ''} · {totalMarks} marks
            </span>
          </div>
        </div>
        {assessment.status === 'draft' && (
          <form action={publishAssessment}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Publish
            </button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left — Assessment form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#334155]">Assessment settings</h2>
            <AssessmentForm assessment={assessment as Assessment} />
          </div>
        </div>

        {/* Right — Questions */}
        <div className="lg:col-span-3 space-y-4">
          {/* Current questions */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#334155]">
                Questions
                <span className="ml-2 text-xs font-normal text-[#94A3B8]">
                  {(aqRows ?? []).length} · {totalMarks} marks total
                </span>
              </h2>
            </div>

            {aqRows && aqRows.length > 0 ? (
              <div className="divide-y divide-[#F1F5F9]">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {aqRows.map((aq: any, idx: number) => {
                  const q = aq.question
                  if (!q) return null
                  return (
                    <div key={aq.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#F8FAFC]">
                      {/* Order */}
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]">
                        {idx + 1}
                      </span>

                      {/* Question */}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-[#0F172A]">{q.question_text}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUESTION_TYPE_COLORS[q.type as keyof typeof QUESTION_TYPE_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                            {QUESTION_TYPE_LABELS[q.type as keyof typeof QUESTION_TYPE_LABELS] ?? q.type}
                          </span>
                          <span className="text-[11px] text-[#94A3B8]">
                            {DIFFICULTY_LABELS[q.difficulty as keyof typeof DIFFICULTY_LABELS] ?? q.difficulty}
                          </span>
                          <span className="text-[11px] font-semibold text-[#334155]">
                            {aq.marks_override ?? q.marks} mark{(aq.marks_override ?? q.marks) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <form action={removeQuestionFromAssessment}>
                        <input type="hidden" name="id" value={aq.id} />
                        <input type="hidden" name="assessment_id" value={id} />
                        <button
                          type="submit"
                          className="shrink-0 rounded p-1.5 text-[#CBD5E1] hover:bg-red-50 hover:text-red-400"
                          title="Remove from assessment"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <svg className="mx-auto mb-3 h-8 w-8 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-[#334155]">No questions yet</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Add questions from the bank below.</p>
              </div>
            )}
          </div>

          {/* Question picker */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white">
            <div className="border-b border-[#E2E8F0] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#334155]">Add from Question Bank</h2>
              <p className="mt-0.5 text-xs text-[#94A3B8]">
                Showing published questions not yet in this assessment.
              </p>
            </div>
            <QuestionPicker
              assessmentId={id}
              questions={availableQuestions ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
