import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyAttemptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile/attempts')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: attempts } = await db
    .from('attempts')
    .select(`
      id, is_complete, auto_score, total_marks, score_percentage,
      time_taken_seconds, started_at, submitted_at,
      assessment:assessments(id, title, level, subject, pass_mark)
    `)
    .eq('user_id', user.id)
    .not('assessment_id', 'is', null)
    .order('started_at', { ascending: false })

  const completed = attempts?.filter((a: { is_complete: boolean }) => a.is_complete) ?? []
  const scores = completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((a: any) => a.score_percentage !== null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((a: any) => Number(a.score_percentage))
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length) : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const passCount = completed.filter((a: any) => a.assessment?.pass_mark && a.score_percentage >= a.assessment.pass_mark).length

  function formatDuration(secs: number | null) {
    if (!secs) return '—'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <h1 className="mb-1 text-2xl font-bold text-[#0F172A]">My Attempts</h1>
        <p className="mb-6 text-sm text-[#64748B]">Your assessment history</p>

        {/* Summary stats */}
        {completed.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-center">
              <p className="text-2xl font-bold text-[#3457A6]">{completed.length}</p>
              <p className="text-xs text-[#94A3B8]">Completed</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-center">
              <p className="text-2xl font-bold text-[#0F172A]">{avgScore !== null ? `${avgScore}%` : '—'}</p>
              <p className="text-xs text-[#94A3B8]">Avg score</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{passCount}</p>
              <p className="text-xs text-[#94A3B8]">Passed</p>
            </div>
          </div>
        )}

        {/* Attempt list */}
        {attempts && attempts.length > 0 ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {attempts.map((a: any) => {
              const passed = a.assessment?.pass_mark && a.score_percentage !== null
                ? a.score_percentage >= a.assessment.pass_mark
                : null
              return (
                <div key={a.id} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0F172A]">
                        {a.assessment?.title ?? 'Unknown assessment'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {a.assessment?.subject && (
                          <span className="text-xs text-[#64748B]">{a.assessment.subject}</span>
                        )}
                        <span className="text-[11px] text-[#94A3B8]">
                          {new Date(a.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {a.time_taken_seconds && (
                          <span className="text-[11px] text-[#94A3B8]">· {formatDuration(a.time_taken_seconds)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {a.is_complete ? (
                        <>
                          {a.score_percentage !== null && (
                            <span className={`text-xl font-bold ${
                              passed === true ? 'text-emerald-600' : passed === false ? 'text-red-500' : 'text-[#3457A6]'
                            }`}>
                              {Math.round(a.score_percentage)}%
                            </span>
                          )}
                          {passed !== null && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                            }`}>
                              {passed ? 'Passed' : 'Not passed'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          In progress
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.is_complete ? (
                      <>
                        <Link
                          href={`/attempts/${a.id}/results`}
                          className="rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#3457A6] hover:bg-[#DBEAFE]"
                        >
                          View results
                        </Link>
                        <Link
                          href={`/attempts/${a.id}/review`}
                          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F8FAFC]"
                        >
                          Review answers
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/attempts/${a.id}`}
                        className="rounded-lg bg-[#3457A6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2B4A96]"
                      >
                        Continue →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
            <svg className="mx-auto mb-4 h-10 w-10 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium text-[#334155]">No attempts yet</p>
            <p className="mt-1 text-xs text-[#94A3B8]">Take your first assessment to track your progress.</p>
            <Link
              href="/assessments"
              className="mt-4 inline-block rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2B4A96]"
            >
              Browse assessments
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
