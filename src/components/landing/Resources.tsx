const resources = [
  {
    title: 'Past Papers',
    description: 'National examination papers organized by level, subject, and year.',
    color: '#EAF0F8',
    text: '#27438A',
  },
  {
    title: 'Marking Schemes',
    description: 'Official model answers and marking guidelines for past papers.',
    color: '#E6F4F2',
    text: '#0A7068',
  },
  {
    title: 'Syllabi',
    description: 'Current curriculum syllabi for all levels and subjects.',
    color: '#EAF0F8',
    text: '#27438A',
  },
  {
    title: 'Teacher Notes',
    description: 'Verified educator-contributed notes and teaching resources.',
    color: '#E6F4F2',
    text: '#0A7068',
  },
  {
    title: 'Books & Guides',
    description: 'Approved textbooks and educational reference materials.',
    color: '#FFFBEB',
    text: '#92400E',
  },
  {
    title: 'Curriculum Materials',
    description: 'Official and supplementary materials aligned to REB curriculum.',
    color: '#FFFBEB',
    text: '#92400E',
  },
]

export function Resources() {
  return (
    <section id="resources" className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            Resource Library
          </p>
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">
            Everything in one place.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#64748B]">
            Every resource is reviewed, verified, and categorized before publication.
            No unmoderated uploads. No unverified content.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <div
              key={r.title}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6"
            >
              <span
                className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: r.color, color: r.text }}
              >
                {r.title}
              </span>
              <p className="text-sm leading-relaxed text-[#334155]">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
