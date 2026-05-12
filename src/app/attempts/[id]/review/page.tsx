import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from '@/types'

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: attempt, error } = await db
    .from('attempts')
    .select('id, user_id, is_complete, assessment:assessments(id, title, allow_review, show_results)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !attempt || !attempt.is_complete) notFound()
  if (attempt.assessment?.allow_review === false) redirect(`/attempts/${id}/results`)

  // Load answers with questions
  const { data: answerRows } = await db
    .from('attempt_answers')
    .select(`
      id, selected_option, answer_text, is_correct, auto_marks,
      question:questions(id, question_text, type, options, correct_option, correct_answer, explanation, marks)
    `)
    .eq('attempt_id', id)

  const showResults = attempt.assessment?.show_results !== false

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/attempts/${id}/results`}
            className="mb-3 flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to results
          </Link>
          <h1 className="text-xl font-semibold text-[#0F172A]">Answer Review</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">{attempt.assessment?.title}</p>
        </div>

        {/* Answer cards */}
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(answerRows ?? []).map((a: any, idx: number) => {
            const q = a.question
            if (!q) return null

            const isAutoMark = q.type === 'mcq' || q.type === 'true_false'
            const correct = isAutoMark ? a.is_correct : null
            const userSelected = a.selected_option
            const userText = a.answer_text

            return (
              <div
                key={a.id}
                className={`rounded-xl border bg-white p-5 ${
                  showResults && correct === true
                    ? 'border-emerald-200'
                    : showResults && correct === false
                    ? 'border-red-200'
                    : 'border-[#E2E8F0]'
                }`}
              >
                {/* Question header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]">
                      {idx + 1}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUESTION_TYPE_COLORS[q.type as keyof typeof QUESTION_TYPE_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      {QUESTION_TYPE_LABELS[q.type as keyof typeof QUESTION_TYPE_LABELS] ?? q.type}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  </div>

                  {showResults && isAutoMark && (
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {correct ? (
                        <>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Correct
                        </>
                      ) : (
                        <>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Incorrect
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Question text */}
                <p className="mb-4 text-sm font-medium text-[#0F172A] leading-relaxed">{q.question_text}</p>

                {/* MCQ options */}
                {isAutoMark && q.options && (
                  <div className="space-y-1.5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {q.options.map((opt: any) => {
                      const isUserChoice = userSelected === opt.id
                      const isCorrectOpt = showResults && q.correct_option === opt.id
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
                            isCorrectOpt && showResults
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : isUserChoice && !isCorrectOpt && showResults
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : isUserChoice && !showResults
                              ? 'border-[#3457A6] bg-[#EFF6FF] text-[#3457A6]'
                              : 'border-[#E2E8F0] text-[#64748B]'
                          }`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-current text-[10px] font-bold">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          <div className="flex shrink-0 gap-1">
                            {isUserChoice && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide">Your answer</span>
                            )}
                            {isCorrectOpt && showResults && (
                              <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Text answer */}
                {!isAutoMark && userText && (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Your answer</p>
                    <p className="text-sm text-[#334155] whitespace-pre-wrap">{userText}</p>
                  </div>
                )}

                {!isAutoMark && !userText && (
                  <p className="text-xs italic text-[#94A3B8]">No answer provided.</p>
                )}

                {/* Model answer (short) */}
                {showResults && q.correct_answer && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Model answer</p>
                    <p className="text-sm text-emerald-800">{q.correct_answer}</p>
                  </div>
                )}

                {/* Explanation */}
                {showResults && q.explanation && (
                  <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Explanation</p>
                    <p className="text-sm text-[#475569]">{q.explanation}</p>
                  </div>
                )}

                {/* Manual marking note */}
                {!isAutoMark && !showResults && (
                  <p className="mt-3 text-xs text-[#94A3B8]">
                    This question requires manual marking.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/attempts/${id}/results`}
            className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-center text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
          >
            Back to results
          </Link>
          {attempt.assessment?.id && (
            <Link
              href={`/assessments/${attempt.assessment.id}`}
              className="flex-1 rounded-xl bg-[#3457A6] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
            >
              Try again
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
