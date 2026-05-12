export function PartnerCTA() {
  return (
    <section id="partner" className="border-t border-[#E2E8F0] bg-[#3457A6] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#ADC0E1]">
          Institutional Partnerships
        </p>
        <h2 className="mb-5 text-2xl font-semibold text-white sm:text-3xl">
          Collaborate with Ubumenyi.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-[#ADC0E1]">
          We are actively seeking partnerships with educational institutions, schools,
          organizations, and government bodies committed to improving educational
          accessibility across Rwanda. All collaborations are built on authorized sourcing,
          responsible publication, and institutional respect.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { title: 'Schools & Institutions', desc: 'Content partnership and platform access' },
            { title: 'Government Bodies', desc: 'Authorized curriculum and material sourcing' },
            { title: 'Organizations & NGOs', desc: 'Educational resource collaboration' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#4F6FB8] bg-[#2E50A2] p-5 text-left"
            >
              <p className="mb-1 text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs leading-relaxed text-[#ADC0E1]">{item.desc}</p>
            </div>
          ))}
        </div>

        <a
          href="mailto:hello@ubumenyi.rw"
          className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-[#3457A6] transition-colors hover:bg-[#F8FAFC]"
        >
          Get in touch — hello@ubumenyi.rw
        </a>
      </div>
    </section>
  )
}
