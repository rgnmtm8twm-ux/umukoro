import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Apply',
    description: 'Submit your contributor application with your credentials, institution, and subject expertise.',
  },
  {
    number: '02',
    title: 'Reviewed',
    description: 'Our moderation team individually reviews every application for authenticity and quality.',
  },
  {
    number: '03',
    title: 'Verified',
    description: 'Approved contributors receive a verified badge and can publish educational resources.',
  },
  {
    number: '04',
    title: 'Publish',
    description: 'Every upload goes through a quality review before being made available to learners.',
  },
]

export function ContributorsCTA() {
  return (
    <section className="border-t border-[#E2E8F0] bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5">
            <svg className="h-3.5 w-3.5 text-[#3457A6]" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold text-[#3457A6]">Verified Contributors</span>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-[#0F172A] sm:text-3xl">
            Contribute to Rwanda&apos;s educational infrastructure.
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#64748B]">
            We welcome teachers, schools, and institutions to contribute high-quality educational
            materials. Every contributor is individually verified. Every upload is moderated before
            publication.
          </p>
        </div>

        {/* Process steps */}
        <div className="mb-10 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-xs font-bold text-[#3457A6]">
                {step.number}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-[#0F172A]">{step.title}</h3>
              <p className="text-xs leading-relaxed text-[#64748B]">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Contributor types */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {[
            { label: 'Teachers', icon: '🎓' },
            { label: 'Schools', icon: '🏫' },
            { label: 'Institutions', icon: '🏛️' },
            { label: 'Educational Orgs', icon: '📚' },
          ].map((type) => (
            <div
              key={type.label}
              className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-medium text-[#334155]"
            >
              <span>{type.icon}</span>
              {type.label}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contributors"
            className="rounded-lg border border-[#E2E8F0] bg-white px-6 py-2.5 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
          >
            Browse contributors
          </Link>
          <a
            href="mailto:hello@ubumenyi.rw?subject=Contributor Application"
            className="rounded-lg bg-[#3457A6] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
          >
            Apply to contribute
          </a>
        </div>
      </div>
    </section>
  )
}
