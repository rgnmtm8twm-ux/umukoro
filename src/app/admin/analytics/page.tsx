import { createClient } from '@/lib/supabase/server'
import { BarChart } from '@/components/charts/BarChart'
import { DonutChart } from '@/components/charts/DonutChart'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Question stats ────────────────────────────────────────────
  const { data: questionStats } = await db
    .from('questions')
    .select('status, type, difficulty')
    .is('paper_id', null)

  const qByStatus: Record<string, number> = {}
  const qByType: Record<string, number> = {}
  const qByDifficulty: Record<string, number> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionStats?.forEach((q: any) => {
    qByStatus[q.status] = (qByStatus[q.status] ?? 0) + 1
    qByType[q.type] = (qByType[q.type] ?? 0) + 1
    qByDifficulty[q.difficulty] = (qByDifficulty[q.difficulty] ?? 0) + 1
  })

  // ── Assessment stats ──────────────────────────────────────────
  const { data: assessmentStats } = await db.from('assessments').select('status')
  const aByStatus: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assessmentStats?.forEach((a: any) => {
    aByStatus[a.status] = (aByStatus[a.status] ?? 0) + 1
  })

  // ── Attempt stats ──────────────────────────────────────────────
  const { data: attemptStats } = await db
    .from('attempts')
    .select('is_complete, score_percentage, assessment_id')
    .not('assessment_id', 'is', null)

  const totalAttempts = attemptStats?.length ?? 0
  const completedAttempts = attemptStats?.filter((a: { is_complete: boolean }) => a.is_complete).length ?? 0
  const scores = attemptStats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.filter((a: any) => a.is_complete && a.score_percentage !== null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((a: any) => Number(a.score_percentage)) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length) : null

  // Score distribution
  const scoreBuckets = [
    { label: '0–20', min: 0, max: 20, color: '#EF4444' },
    { label: '21–40', min: 21, max: 40, color: '#F97316' },
    { label: '41–60', min: 41, max: 60, color: '#EAB308' },
    { label: '61–80', min: 61, max: 80, color: '#22C55E' },
    { label: '81–100', min: 81, max: 100, color: '#10B981' },
  ].map((b) => ({
    ...b,
    value: scores.filter((s: number) => s >= b.min && s <= b.max).length,
  }))

  // ── Top assessments ───────────────────────────────────────────
  const { data: topAssessments } = await db
    .from('assessments')
    .select('id, title, total_marks')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)

  const attemptsByAssessment: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attemptStats?.forEach((a: any) => {
    if (a.assessment_id) {
      attemptsByAssessment[a.assessment_id] = (attemptsByAssessment[a.assessment_id] ?? 0) + 1
    }
  })

  const TYPE_COLORS: Record<string, string> = {
    mcq: '#3457A6',
    true_false: '#10B981',
    short: '#F97316',
    long: '#8B5CF6',
    math: '#EC4899',
    written: '#64748B',
  }

  const TYPE_DISPLAY: Record<string, string> = {
    mcq: 'MCQ',
    true_false: 'T/F',
    short: 'Short',
    long: 'Long',
    math: 'Math',
    written: 'Written',
  }

  const DIFF_COLORS: Record<string, string> = {
    easy: '#10B981',
    medium: '#EAB308',
    hard: '#EF4444',
  }

  function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <p className="text-xs text-[#94A3B8]">{label}</p>
        <p className="mt-1 text-2xl font-bold text-[#0F172A]">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-[#64748B]">{sub}</p>}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#0F172A]">Analytics</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">Overview of the Umukoro assessment engine</p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total questions" value={questionStats?.length ?? 0} sub={`${qByStatus['published'] ?? 0} published`} />
        <StatCard label="Assessments" value={assessmentStats?.length ?? 0} sub={`${aByStatus['published'] ?? 0} published`} />
        <StatCard label="Total attempts" value={totalAttempts} sub={`${completedAttempts} completed`} />
        <StatCard label="Avg score" value={avgScore !== null ? `${avgScore}%` : '—'} sub="across all attempts" />
      </div>

      {/* Charts row 1 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Question by type */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#334155]">Questions by type</h2>
          <DonutChart
            data={Object.entries(qByType).map(([type, count]) => ({
              label: TYPE_DISPLAY[type] ?? type,
              value: count,
              color: TYPE_COLORS[type] ?? '#CBD5E1',
            }))}
          />
        </div>

        {/* Question by difficulty */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#334155]">Questions by difficulty</h2>
          <DonutChart
            data={['easy', 'medium', 'hard']
              .filter((d) => qByDifficulty[d])
              .map((d) => ({
                label: d.charAt(0).toUpperCase() + d.slice(1),
                value: qByDifficulty[d] ?? 0,
                color: DIFF_COLORS[d],
              }))
            }
          />
        </div>

        {/* Question statuses */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#334155]">Question statuses</h2>
          <DonutChart
            data={[
              { label: 'Published', value: qByStatus['published'] ?? 0, color: '#10B981' },
              { label: 'Pending', value: qByStatus['pending_review'] ?? 0, color: '#EAB308' },
              { label: 'Draft', value: qByStatus['draft'] ?? 0, color: '#CBD5E1' },
              { label: 'Rejected', value: qByStatus['rejected'] ?? 0, color: '#EF4444' },
            ].filter((d) => d.value > 0)}
          />
        </div>
      </div>

      {/* Score distribution */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-[#334155]">Score distribution</h2>
          <p className="mb-4 text-xs text-[#94A3B8]">Completed attempts by score band</p>
          {scores.length > 0 ? (
            <BarChart
              data={scoreBuckets.map((b) => ({ label: b.label, value: b.value, color: b.color }))}
              height={120}
            />
          ) : (
            <p className="py-8 text-center text-xs text-[#94A3B8]">No completed attempts yet.</p>
          )}
        </div>

        {/* Top assessments */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#334155]">Published assessments</h2>
          {topAssessments && topAssessments.length > 0 ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {topAssessments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-[#F8FAFC]">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[#334155]">{a.title}</p>
                    <p className="text-[11px] text-[#94A3B8]">{a.total_marks} marks</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F1F5F9] px-2 py-1">
                    <svg className="h-3 w-3 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[11px] font-semibold text-[#334155]">
                      {attemptsByAssessment[a.id] ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-[#94A3B8]">No published assessments.</p>
          )}
        </div>
      </div>
    </div>
  )
}
