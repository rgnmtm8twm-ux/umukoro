import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Stats for social proof
  const [{ count: assessmentCount }, { count: questionCount }] = await Promise.all([
    supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488]">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="text-base font-semibold text-[#0F172A]">Umukoro</span>
          </div>
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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-4 py-1.5 text-sm font-medium text-[#0D9488]">
            <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
            Free for all Rwandan students
          </div>
          <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-5xl">
            Practice exams built for<br />
            <span className="text-[#0D9488]">Rwanda&apos;s national curriculum</span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-[#64748B]">
            Timed assessments, instant auto-marking, and detailed answer review — designed for
            PLE, O&apos;Level, and A&apos;Level exam preparation.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/assessments"
              className="rounded-lg bg-[#0D9488] px-6 py-3 text-sm font-medium text-white hover:bg-[#0f766e] transition-colors"
            >
              Browse Assessments
            </Link>
            <Link
              href="https://getubumenyi.com"
              className="rounded-lg border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A] transition-colors"
            >
              Get Study Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-semibold text-[#0F172A]">{assessmentCount ?? 0}+</p>
              <p className="mt-1 text-sm text-[#64748B]">Published Assessments</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-[#0F172A]">{questionCount ?? 0}+</p>
              <p className="mt-1 text-sm text-[#64748B]">Questions in Bank</p>
            </div>
            <div className="col-span-2 text-center sm:col-span-1">
              <p className="text-3xl font-semibold text-[#0F172A]">Free</p>
              <p className="mt-1 text-sm text-[#64748B]">Always</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-2xl font-semibold text-[#0F172A]">
          Built for serious exam prep
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: '⏱',
              title: 'Timed Exams',
              desc: 'Practice under real exam conditions with countdown timers and auto-submit when time runs out.',
            },
            {
              icon: '✅',
              title: 'Instant Marking',
              desc: 'MCQ and true/false questions are auto-marked the moment you submit. See your score immediately.',
            },
            {
              icon: '📖',
              title: 'Answer Review',
              desc: 'Go through every question after submission. See the correct answer and explanation side by side.',
            },
            {
              icon: '📊',
              title: 'Progress Tracking',
              desc: 'Track your scores across multiple attempts and see which subjects need more attention.',
            },
            {
              icon: '🎯',
              title: 'Curriculum-Aligned',
              desc: 'Questions written and reviewed by Rwandan educators, aligned to REB syllabi.',
            },
            {
              icon: '📱',
              title: 'Mobile-First',
              desc: 'Works on any phone or computer. Study anywhere — no app download required.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-[#E2E8F0] p-6">
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-2 text-sm font-semibold text-[#0F172A]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#64748B]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0D9488]">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-white">Ready to start practising?</h2>
          <p className="mb-8 text-[#CCFBF1]">
            Free for every Rwandan student — no account required to browse.
          </p>
          <Link
            href="/assessments"
            className="inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-[#0D9488] hover:bg-[#F0FDFA] transition-colors"
          >
            Browse Assessments
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0D9488]">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-sm font-medium text-[#0F172A]">Umukoro</span>
              <span className="text-sm text-[#94A3B8]">· Part of Ubumenyi</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/assessments" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Assessments</Link>
              <Link href="https://getubumenyi.com" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Resources</Link>
              <Link href="/admin" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
