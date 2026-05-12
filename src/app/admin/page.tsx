import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [
    { count: totalQuestions },
    { count: publishedQuestions },
    { count: pendingQuestions },
    { count: totalAssessments },
    { count: publishedAssessments },
    { count: totalAttempts },
  ] = await Promise.all([
    db.from('questions').select('*', { count: 'exact', head: true }),
    db.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    db.from('assessments').select('*', { count: 'exact', head: true }),
    db.from('assessments').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('attempts').select('*', { count: 'exact', head: true }).eq('is_complete', true),
  ])

  const stats = [
    { label: 'Total Questions', value: totalQuestions ?? 0, href: '/admin/questions', color: 'text-[#0D9488]' },
    { label: 'Published Questions', value: publishedQuestions ?? 0, href: '/admin/questions', color: 'text-emerald-600' },
    { label: 'Pending Review', value: pendingQuestions ?? 0, href: '/admin/questions', color: 'text-amber-600' },
    { label: 'Total Assessments', value: totalAssessments ?? 0, href: '/admin/assessments', color: 'text-[#3457A6]' },
    { label: 'Published Assessments', value: publishedAssessments ?? 0, href: '/admin/assessments', color: 'text-emerald-600' },
    { label: 'Completed Attempts', value: totalAttempts ?? 0, href: '/admin/analytics', color: 'text-[#0F172A]' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#0F172A]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">Umukoro Assessment Engine overview</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-xl border border-[#E2E8F0] bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <p className="text-sm text-[#64748B]">{s.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Pending review alert */}
      {(pendingQuestions ?? 0) > 0 && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-amber-800">
              {pendingQuestions} question{pendingQuestions !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          <Link
            href="/admin/questions"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Review →
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/questions/new"
          className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 text-sm font-medium text-[#0F172A] hover:shadow-sm transition-shadow"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ECFDF5]">
            <svg className="h-4 w-4 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          Add Question
        </Link>
        <Link
          href="/admin/assessments/new"
          className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 text-sm font-medium text-[#0F172A] hover:shadow-sm transition-shadow"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF]">
            <svg className="h-4 w-4 text-[#3457A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          New Assessment
        </Link>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 text-sm font-medium text-[#0F172A] hover:shadow-sm transition-shadow"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF7ED]">
            <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          View Analytics
        </Link>
      </div>
    </div>
  )
}
