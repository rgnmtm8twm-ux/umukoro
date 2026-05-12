import Link from 'next/link'

const levels = [
  { label: 'Primary', sub: 'P1–P6', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  { label: "O'Level", sub: 'S1–S3', color: 'bg-blue-50 border-blue-100 text-blue-700' },
  { label: "A'Level", sub: 'S4–S6', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
  { label: 'TVET', sub: 'Vocational', color: 'bg-amber-50 border-amber-100 text-amber-700' },
]

const stats = [
  { value: '7+', label: 'Resource types' },
  { value: 'REB', label: 'Curriculum-aligned' },
  { value: '100%', label: 'Free access' },
  { value: 'Verified', label: 'Every contributor' },
]

export function Hero() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3457A6]" />
            <span className="text-xs font-semibold text-[#3457A6]">
              Rwanda Educational Resource Initiative
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-5 text-center text-3xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-5xl sm:leading-tight">
          Rwanda&apos;s Educational Resources.{' '}
          <span className="text-[#3457A6]">Organized. Accessible. Trusted.</span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-center text-base leading-relaxed text-[#475569] sm:text-lg">
          Past papers, syllabi, curriculum materials, and verified educational resources —
          centralized, free, and accessible to every student, teacher, and institution in Rwanda.
        </p>

        {/* CTAs */}
        <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/resources"
            className="w-full rounded-lg bg-[#3457A6] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96] sm:w-auto"
          >
            Browse Resource Library →
          </Link>
          <Link
            href="/#partner"
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-6 py-3 text-center text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] sm:w-auto"
          >
            Partner with Ubumenyi
          </Link>
        </div>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-center">
              <p className="text-xl font-bold text-[#3457A6]">{s.value}</p>
              <p className="mt-0.5 text-xs text-[#64748B]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Level indicators */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {levels.map((l) => (
            <Link
              key={l.label}
              href={`/resources?level=${l.label === 'Primary' ? 'primary' : l.label === "O'Level" ? 'o_level' : l.label === "A'Level" ? 'a_level' : 'tvet'}`}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-shadow hover:shadow-sm ${l.color}`}
            >
              <div>
                <p className="text-xs font-semibold">{l.label}</p>
                <p className="text-[10px] opacity-70">{l.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
