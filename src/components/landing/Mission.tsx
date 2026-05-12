const values = [
  'Authorized sourcing',
  'Verified content',
  'Free access',
  'Institutional trust',
  'Curriculum-aligned',
]

export function Mission() {
  return (
    <section id="mission" className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          Our Mission
        </p>
        <blockquote className="mb-8 text-xl font-semibold leading-relaxed text-[#0F172A] sm:text-2xl sm:leading-relaxed">
          &ldquo;Every student and teacher in Rwanda deserves access to organized, verified
          educational materials — without barriers, paywalls, or unreliable sources.&rdquo;
        </blockquote>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          Ubumenyi is building Rwanda&apos;s first centralized educational resource infrastructure —
          a trusted platform where schools, educators, and institutions can contribute and access
          high-quality materials aligned to the REB curriculum.
        </p>
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#3457A6]"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
