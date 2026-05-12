import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  publishAssessment,
  archiveAssessment,
  deleteAssessment,
} from '@/actions/umukoro'
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_STATUS_COLORS,
  LEVEL_LABELS,
} from '@/types'

export default async function AdminAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let query = db
    .from('assessments')
    .select('id, title, description, level, subject, status, duration_minutes, total_marks, pass_mark, created_at, published_at')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') query = query.eq('status', params.status)
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: assessments } = await query

  // Counts
  const { data: allStatuses } = await db.from('assessments').select('status')
  const statusCounts: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allStatuses?.forEach((a: any) => {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1
  })

  const tabs = [
    { key: 'all', label: 'All', count: allStatuses?.length ?? 0 },
    { key: 'published', label: 'Published', count: statusCounts['published'] ?? 0 },
    { key: 'draft', label: 'Drafts', count: statusCounts['draft'] ?? 0 },
    { key: 'archived', label: 'Archived', count: statusCounts['archived'] ?? 0 },
  ]

  const activeStatus = params.status ?? 'all'

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Assessments</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">{assessments?.length ?? 0} assessments</p>
        </div>
        <Link
          href="/admin/assessments/new"
          className="flex items-center gap-2 rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Assessment
        </Link>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'all' ? '/admin/assessments' : `/admin/assessments?status=${tab.key}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeStatus === tab.key || (tab.key === 'all' && !params.status)
                ? 'bg-[#3457A6] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                activeStatus === tab.key || (tab.key === 'all' && !params.status)
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}>
                {tab.count}
              </span>
            )}
          </Link>
        ))}

        {/* Search */}
        <form method="GET" action="/admin/assessments" className="ml-auto flex items-center gap-2">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search assessments…"
            className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
          <button type="submit" className="rounded-lg bg-[#F1F5F9] px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#E2E8F0]">
            Search
          </button>
          {params.q && (
            <Link href={params.status ? `/admin/assessments?status=${params.status}` : '/admin/assessments'} className="text-xs text-[#94A3B8] hover:text-[#64748B]">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Grid / List */}
      {assessments && assessments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {assessments.map((a: any) => (
            <div key={a.id} className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white hover:shadow-sm transition-shadow">
              <div className="flex-1 p-5">
                {/* Title row */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[#0F172A] leading-snug">{a.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ASSESSMENT_STATUS_COLORS[a.status as keyof typeof ASSESSMENT_STATUS_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    {ASSESSMENT_STATUS_LABELS[a.status as keyof typeof ASSESSMENT_STATUS_LABELS] ?? a.status}
                  </span>
                </div>

                {a.description && (
                  <p className="mb-3 line-clamp-2 text-xs text-[#64748B]">{a.description}</p>
                )}

                {/* Meta chips */}
                <div className="flex flex-wrap gap-1.5">
                  {a.level && (
                    <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#3457A6]">
                      {LEVEL_LABELS[a.level as keyof typeof LEVEL_LABELS] ?? a.level}
                    </span>
                  )}
                  {a.subject && (
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">{a.subject}</span>
                  )}
                  {a.duration_minutes && (
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">
                      {a.duration_minutes} min
                    </span>
                  )}
                  {a.total_marks > 0 && (
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">
                      {a.total_marks} marks
                    </span>
                  )}
                  {a.pass_mark && (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                      Pass: {a.pass_mark}%
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-2.5">
                <p className="text-[11px] text-[#94A3B8]">
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                    : '—'}
                </p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/assessments/${a.id}/edit`}
                    className="rounded px-2 py-1 text-xs font-semibold text-[#3457A6] hover:bg-[#EFF6FF]"
                  >
                    Edit
                  </Link>

                  {a.status === 'draft' && (
                    <form action={publishAssessment}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                        Publish
                      </button>
                    </form>
                  )}

                  {a.status === 'published' && (
                    <form action={archiveAssessment}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="rounded px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#F1F5F9]">
                        Archive
                      </button>
                    </form>
                  )}

                  <form action={deleteAssessment}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                      onClick={(e: React.MouseEvent) => {
                        if (!confirm('Delete this assessment and all its questions?')) e.preventDefault()
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
          <svg className="mb-4 h-10 w-10 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-sm font-medium text-[#334155]">No assessments yet</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Create your first assessment to get started.</p>
          <Link
            href="/admin/assessments/new"
            className="mt-4 rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2B4A96]"
          >
            New Assessment
          </Link>
        </div>
      )}
    </div>
  )
}
