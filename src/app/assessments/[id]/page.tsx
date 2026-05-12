import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { startAttempt } from '@/actions/umukoro'
import { LEVEL_LABELS, LEVEL_COLORS } from '@/types'

export default async function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: assessment, error } = await db
    .from('assessments')
    .select('id, title, description, instructions, level, subject, combination, language, duration_minutes, total_marks, pass_mark, shuffle_questions, show_results, allow_review, max_attempts, status, published_at')
    .eq('id', id)
    .single()

  if (error || !assessment || assessment.status !== 'published') notFound()

  // Get question count
  const { count: questionCount } = await db
    .from('assessment_questions')
    .select('id', { count: 'exact', head: true })
    .eq('assessment_id', id)

  // Check if user is logged in + previous attempts
  const { data: { user } } = await supabase.auth.getUser()
  let attemptCount = 0
  let canStart = true

  if (user) {
    const { count } = await db
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('assessment_id', id)
      .eq('user_id', user.id)
      .eq('is_complete', true)
    attemptCount = count ?? 0
    if (assessment.max_attempts && attemptCount >= assessment.max_attempts) {
      canStart = false
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        {/* Back */}
        <Link href="/assessments" className="mb-6 flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B]">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All assessments
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            {/* Level + subject */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {assessment.level && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_COLORS[assessment.level as keyof typeof LEVEL_COLORS] ?? ''}`}>
                  {LEVEL_LABELS[assessment.level as keyof typeof LEVEL_LABELS] ?? assessment.level}
                </span>
              )}
              {assessment.subject && (
                <span className="rounded-full border border-[#E2E8F0] px-2.5 py-1 text-xs text-[#64748B]">
                  {assessment.subject}
                </span>
              )}
              {assessment.combination && (
                <span className="rounded-full border border-[#E2E8F0] px-2.5 py-1 text-xs text-[#64748B]">
                  {assessment.combination}
                </span>
              )}
            </div>

            <h1 className="mb-3 text-2xl font-bold text-[#0F172A]">{assessment.title}</h1>

            {assessment.description && (
              <p className="mb-6 text-sm text-[#64748B]">{assessment.description}</p>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
                    </svg>
                  ),
                  label: 'Questions',
                  value: questionCount ?? 0,
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  label: 'Total marks',
                  value: assessment.total_marks,
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: 'Duration',
                  value: assessment.duration_minutes ? `${assessment.duration_minutes} min` : 'No limit',
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ),
                  label: 'Pass mark',
                  value: assessment.pass_mark ? `${assessment.pass_mark}%` : 'N/A',
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1 rounded-xl border border-[#E2E8F0] p-3">
                  <span className="text-[#94A3B8]">{stat.icon}</span>
                  <span className="text-lg font-bold text-[#0F172A]">{stat.value}</span>
                  <span className="text-[11px] text-[#94A3B8]">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Instructions */}
            {assessment.instructions && (
              <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="mb-1 text-xs font-semibold text-[#334155]">Instructions</p>
                <p className="text-sm text-[#475569] whitespace-pre-wrap">{assessment.instructions}</p>
              </div>
            )}

            {/* Max attempts warning */}
            {sp.error === 'max_attempts' && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                You have reached the maximum number of attempts for this assessment.
              </div>
            )}

            {user && assessment.max_attempts && (
              <p className="mb-4 text-xs text-[#94A3B8]">
                You have used {attemptCount} of {assessment.max_attempts} allowed attempt{assessment.max_attempts !== 1 ? 's' : ''}.
              </p>
            )}

            {/* CTA */}
            {!user ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/login?next=/assessments/${id}`}
                  className="flex-1 rounded-xl bg-[#3457A6] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
                >
                  Sign in to start
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-center text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
                >
                  Create account
                </Link>
              </div>
            ) : canStart ? (
              <form action={startAttempt}>
                <input type="hidden" name="assessment_id" value={id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#3457A6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
                >
                  Start assessment
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 text-center">
                <p className="text-sm font-medium text-[#334155]">No more attempts available</p>
                <p className="mt-1 text-xs text-[#94A3B8]">You have used all {assessment.max_attempts} allowed attempts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
