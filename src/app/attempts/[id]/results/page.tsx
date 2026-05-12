import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ResultsPage({
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
    .select(`
      id, user_id, is_complete, auto_score, total_marks, score_percentage,
      time_taken_seconds, started_at, submitted_at,
      assessment:assessments(id, title, pass_mark, show_results, allow_review, level, subject)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !attempt) notFound()
  if (!attempt.is_complete) redirect(`/attempts/${id}`)

  const assessment = attempt.assessment
  const passed = assessment?.pass_mark && attempt.score_percentage !== null
    ? attempt.score_percentage >= assessment.pass_mark
    : null

  const showResults = assessment?.show_results !== false

  function formatDuration(secs: number | null) {
    if (!secs) return '—'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-8">

        {/* Result card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          {/* Status icon */}
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            passed === true ? 'bg-emerald-100' : passed === false ? 'bg-red-100' : 'bg-[#EFF6FF]'
          }`}>
            {passed === true ? (
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : passed === false ? (
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-[#3457A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            )}
          </div>

          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            {assessment?.title}
          </p>
          <h1 className="mb-2 text-3xl font-bold text-[#0F172A]">
            {passed === true ? 'Passed!' : passed === false ? 'Not passed' : 'Submitted'}
          </h1>

          {showResults && attempt.score_percentage !== null ? (
            <>
              <p className="mb-1 text-5xl font-extrabold text-[#3457A6]">
                {Math.round(attempt.score_percentage)}%
              </p>
              <p className="text-sm text-[#64748B]">
                {attempt.auto_score} / {attempt.total_marks} marks
              </p>
              {assessment?.pass_mark && (
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Pass mark: {assessment.pass_mark}%
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#64748B]">Your answers have been recorded.</p>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-[#E2E8F0] p-3">
              <p className="text-[11px] text-[#94A3B8]">Time taken</p>
              <p className="text-lg font-bold text-[#0F172A]">{formatDuration(attempt.time_taken_seconds)}</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] p-3">
              <p className="text-[11px] text-[#94A3B8]">Submitted</p>
              <p className="text-lg font-bold text-[#0F172A]">
                {attempt.submitted_at
                  ? new Date(attempt.submitted_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2">
            {assessment?.allow_review !== false && (
              <Link
                href={`/attempts/${id}/review`}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Review answers
              </Link>
            )}
            {assessment?.id && (
              <Link
                href={`/assessments/${assessment.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#3457A6] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try again
              </Link>
            )}
            <Link
              href="/assessments"
              className="text-center text-xs text-[#94A3B8] hover:text-[#64748B]"
            >
              Back to assessments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
