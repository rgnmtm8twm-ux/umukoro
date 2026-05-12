import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  publishQuestion,
  rejectQuestion,
  archiveQuestion,
  deleteQuestion,
} from '@/actions/umukoro'
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_COLORS,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LEVEL_LABELS,
} from '@/types'

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; level?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let query = db
    .from('questions')
    .select('id, question_text, type, difficulty, marks, level, subject, status, tags, created_at, paper_id')
    .is('paper_id', null) // question bank only (standalone questions)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') query = query.eq('status', params.status)
  if (params.type) query = query.eq('type', params.type)
  if (params.level) query = query.eq('level', params.level)
  if (params.q) query = query.ilike('question_text', `%${params.q}%`)

  const { data: questions } = await query

  // Counts for tabs
  const { data: allStatuses } = await db
    .from('questions')
    .select('status')
    .is('paper_id', null)

  const statusCounts: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allStatuses?.forEach((q: any) => {
    statusCounts[q.status] = (statusCounts[q.status] ?? 0) + 1
  })

  const tabs = [
    { key: 'all', label: 'All', count: allStatuses?.length ?? 0 },
    { key: 'pending_review', label: 'Review', count: statusCounts['pending_review'] ?? 0 },
    { key: 'published', label: 'Published', count: statusCounts['published'] ?? 0 },
    { key: 'draft', label: 'Drafts', count: statusCounts['draft'] ?? 0 },
    { key: 'rejected', label: 'Rejected', count: statusCounts['rejected'] ?? 0 },
    { key: 'archived', label: 'Archived', count: statusCounts['archived'] ?? 0 },
  ]

  const activeStatus = params.status ?? 'all'

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {}
    if (params.status) p.status = params.status
    if (params.type) p.type = params.type
    if (params.level) p.level = params.level
    if (params.q) p.q = params.q
    Object.assign(p, overrides)
    // Remove undefined entries
    Object.keys(p).forEach((k) => { if (!p[k]) delete p[k] })
    const qs = new URLSearchParams(p).toString()
    return `/admin/questions${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Question Bank</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">{questions?.length ?? 0} matching questions</p>
        </div>
        <Link
          href="/admin/questions/new"
          className="flex items-center gap-2 rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Question
        </Link>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'all' ? buildUrl({ status: undefined }) : buildUrl({ status: tab.key })}
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
                  : tab.key === 'pending_review' && tab.count > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}>
                {tab.count}
              </span>
            )}
          </Link>
        ))}

        {/* Filters + search */}
        <form method="GET" action="/admin/questions" className="ml-auto flex flex-wrap items-center gap-2">
          {params.status && <input type="hidden" name="status" value={params.status} />}

          <select
            name="type"
            defaultValue={params.type ?? ''}
            className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs text-[#334155] outline-none focus:border-[#3457A6]"
          >
            <option value="">All types</option>
            {(Object.keys(QUESTION_TYPE_LABELS) as Array<keyof typeof QUESTION_TYPE_LABELS>).map((t) => (
              <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
            ))}
          </select>

          <select
            name="level"
            defaultValue={params.level ?? ''}
            className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs text-[#334155] outline-none focus:border-[#3457A6]"
          >
            <option value="">All levels</option>
            {(Object.keys(LEVEL_LABELS) as Array<keyof typeof LEVEL_LABELS>).map((l) => (
              <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
            ))}
          </select>

          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search questions…"
            className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
          <button type="submit" className="rounded-lg bg-[#F1F5F9] px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#E2E8F0]">
            Filter
          </button>
          {(params.q || params.type || params.level) && (
            <Link href={params.status ? `/admin/questions?status=${params.status}` : '/admin/questions'} className="text-xs text-[#94A3B8] hover:text-[#64748B]">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        {questions && questions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]">Question</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]">Difficulty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]">Level / Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {questions.map((q: any) => (
                  <tr key={q.id} className="hover:bg-[#F8FAFC]">
                    {/* Question text */}
                    <td className="px-4 py-3">
                      <p className="max-w-[280px] truncate text-sm font-medium text-[#0F172A]">
                        {q.question_text}
                      </p>
                      {q.tags && q.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {q.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] text-[#64748B]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUESTION_TYPE_COLORS[q.type as keyof typeof QUESTION_TYPE_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {QUESTION_TYPE_LABELS[q.type as keyof typeof QUESTION_TYPE_LABELS] ?? q.type}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[q.difficulty as keyof typeof DIFFICULTY_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {DIFFICULTY_LABELS[q.difficulty as keyof typeof DIFFICULTY_LABELS] ?? q.difficulty}
                      </span>
                    </td>

                    {/* Marks */}
                    <td className="px-4 py-3 text-xs font-semibold text-[#334155]">{q.marks}</td>

                    {/* Level / Subject */}
                    <td className="px-4 py-3">
                      {q.level && (
                        <p className="text-xs text-[#475569]">
                          {LEVEL_LABELS[q.level as keyof typeof LEVEL_LABELS] ?? q.level}
                        </p>
                      )}
                      {q.subject && (
                        <p className="text-[11px] text-[#94A3B8]">{q.subject}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUESTION_STATUS_COLORS[q.status as keyof typeof QUESTION_STATUS_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {QUESTION_STATUS_LABELS[q.status as keyof typeof QUESTION_STATUS_LABELS] ?? q.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="rounded px-2 py-1 text-xs text-[#3457A6] hover:bg-[#EFF6FF]"
                        >
                          Edit
                        </Link>

                        {q.status === 'pending_review' && (
                          <>
                            <form action={publishQuestion}>
                              <input type="hidden" name="id" value={q.id} />
                              <button type="submit" className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                                Publish
                              </button>
                            </form>
                            <form action={rejectQuestion}>
                              <input type="hidden" name="id" value={q.id} />
                              <button type="submit" className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                                Reject
                              </button>
                            </form>
                          </>
                        )}

                        {q.status === 'draft' && (
                          <form action={publishQuestion}>
                            <input type="hidden" name="id" value={q.id} />
                            <button type="submit" className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                              Publish
                            </button>
                          </form>
                        )}

                        {q.status === 'published' && (
                          <form action={archiveQuestion}>
                            <input type="hidden" name="id" value={q.id} />
                            <button type="submit" className="rounded px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#F1F5F9]">
                              Archive
                            </button>
                          </form>
                        )}

                        <form action={deleteQuestion}>
                          <input type="hidden" name="id" value={q.id} />
                          <button
                            type="submit"
                            className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                            onClick={(e: React.MouseEvent) => {
                              if (!confirm('Permanently delete this question?')) e.preventDefault()
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-4 h-10 w-10 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-[#334155]">No questions found</p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {params.status ? `No questions with status "${params.status}".` : 'Add your first question to get started.'}
            </p>
            <Link
              href="/admin/questions/new"
              className="mt-4 rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2B4A96]"
            >
              New Question
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
