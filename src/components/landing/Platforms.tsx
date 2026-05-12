const platforms = [
  {
    name: 'Ubumenyi',
    tagline: 'The Resource Ecosystem',
    description:
      'The central library of Rwanda\'s educational materials. Past papers, syllabi, marking schemes, teacher notes, approved textbooks — organized by level, subject, and year. Verified before publication.',
    features: ['Past Papers & Marking Schemes', 'Official Syllabi', 'Teacher Notes', 'Approved Textbooks'],
    color: '#3457A6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    tag: '#DBEAFE',
    tagText: '#1E40AF',
  },
  {
    name: 'Umukoro',
    tagline: 'The Assessment System',
    description:
      'An interactive quiz and assessment platform built on Ubumenyi\'s verified content. Students practice with past paper questions, track progress, and identify weak areas — all tied to the REB curriculum.',
    features: ['Past Paper Question Bank', 'Timed Practice Exams', 'Performance Analytics', 'Curriculum-Aligned Topics'],
    color: '#0A7068',
    bg: '#F0FDFB',
    border: '#99F6E4',
    tag: '#CCFBF1',
    tagText: '#134E4A',
  },
]

export function Platforms() {
  return (
    <section id="platforms" className="border-t border-[#E2E8F0] bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            Our Platforms
          </p>
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">
            Two systems. One mission.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border p-8"
              style={{ background: p.bg, borderColor: p.border }}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: p.color }}>
                {p.tagline}
              </p>
              <h3 className="mb-4 text-xl font-semibold text-[#0F172A]">{p.name}</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#475569]">{p.description}</p>
              <ul className="flex flex-col gap-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: p.color }}
                    >
                      ✓
                    </span>
                    <span className="text-xs font-medium text-[#334155]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
