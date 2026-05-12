const audiences = [
  {
    title: 'Students',
    description:
      'Primary, O-Level, and A-Level students preparing for national examinations with organized, accessible materials.',
  },
  {
    title: 'Teachers',
    description:
      'Educators sourcing verified curriculum materials, contributing knowledge, and finding structured teaching resources.',
  },
  {
    title: 'Schools',
    description:
      'Institutions seeking a centralized, trusted resource platform for their students and teaching staff.',
  },
  {
    title: 'Organizations',
    description:
      "Educational institutions and organizations contributing to or partnering on Rwanda's educational infrastructure.",
  },
]

export function ForWhom() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            Who It Serves
          </p>
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">
            Built for Rwanda&apos;s educational community.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6"
            >
              <h3 className="mb-2 text-base font-semibold text-[#0F172A]">{a.title}</h3>
              <p className="text-sm leading-relaxed text-[#64748B]">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
