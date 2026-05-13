import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { LEVEL_LABELS, LEVEL_COLORS } from '@/types'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; subject?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let query = db
    .from('assessments')
    .select('id, title, description, level, subject, duration_minutes, total_marks, pass_mark, language, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (params.level) query = query.eq('level', params.level)
  if (params.subject) query = query.eq('subject', params.subject)
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: assessments } = await query

  const levels = [
    { key: 'primary', label: 'Primary' },
    { key: 'o_level', label: "O'Level" },
    { key: 'a_level', label: "A'Level" },
    { key: 'tvet', label: 'TVET' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center" aria-label="Umukoro home">
            <Image
              src="/umukoro-logo.jpg"
              alt="Umukoro"
              height={32}
              width={120}
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/assessments" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              Assessments
            </Link>
            <Link href="https://getubumenyi.com" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
              Resources
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f766e] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content — assessments listing */}
      <div className="bg-[#F8FAFC]">
        {/* Page header */}
        <div className="border-b border-[#E2E8F0] bg-white px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold text-[#0F172A]">Assessments</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Practice with past paper questions — auto-marked, curriculum-aligned.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Level pills */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  !params.level ? 'bg-[#3457A6] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                }`}
              >
                All
              </Link>
              {levels.map((l) => (
                <Link
                  key={l.key}
                  href={`/?level=${l.key}${params.q ? `&q=${params.q}` : ''}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    params.level === l.key ? 'bg-[#3457A6] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <form method="GET" action="/" className="ml-auto flex items-center gap-2">
              {params.level && <input type="hidden" name="level" value={params.level} />}
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Search assessments…"
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6]"
              />
              <button type="submit" className="rounded-lg bg-[#3457A6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2B4A96]">
                Search
              </button>
            </form>
          </div>

          {/* Grid */}
          {assessments && assessments.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {assessments.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/assessments/${a.id}`}
                  className="group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-[#3457A6]/30 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    {a.level && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_COLORS[a.level as keyof typeof LEVEL_COLORS] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {LEVEL_LABELS[a.level as keyof typeof LEVEL_LABELS] ?? a.level}
                      </span>
                    )}
                    {a.duration_minutes && (
                      <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {a.duration_minutes} min
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 font-semibold text-[#0F172A] group-hover:text-[#3457A6] transition-colors leading-snug">
                    {a.title}
                  </h3>

                  {a.description && (
                    <p className="mb-3 line-clamp-2 text-xs text-[#64748B]">{a.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                    <div className="flex flex-wrap gap-1.5">
                      {a.subject && (
                        <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">{a.subject}</span>
                      )}
                      {a.total_marks > 0 && (
                        <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">
                          {a.total_marks} marks
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#3457A6] group-hover:underline">
                      Start →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
              <svg className="mx-auto mb-4 h-10 w-10 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium text-[#334155]">No assessments available</p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {params.level || params.q ? 'Try adjusting your filters.' : 'Check back soon.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/umukoro-logo.jpg"
                alt="Umukoro"
                height={24}
                width={90}
              />
              <span className="text-sm text-[#94A3B8]">· Part of Ubumenyi</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/assessments" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Assessments</Link>
              <Link href="https://getubumenyi.com" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Resources</Link>
              <a href="mailto:info@ubumenyi.org" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">info@ubumenyi.org</a>
              <Link href="/admin" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
