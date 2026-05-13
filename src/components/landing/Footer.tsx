import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  Platform: [
    { label: 'Resource Library', href: '/resources' },
    { label: 'Contributors', href: '/contributors' },
    { label: 'Past Papers', href: '/resources?type=past_paper' },
    { label: 'Syllabi', href: '/resources?type=syllabus' },
  ],
  Levels: [
    { label: 'Primary (P1–P6)', href: '/resources?level=primary' },
    { label: "O'Level (S1–S3)", href: '/resources?level=o_level' },
    { label: "A'Level (S4–S6)", href: '/resources?level=a_level' },
    { label: 'TVET / Vocational', href: '/resources?level=tvet' },
  ],
  Organization: [
    { label: 'Our Mission', href: '/#mission' },
    { label: 'Partner with us', href: '/#partner' },
    { label: 'Contact', href: 'mailto:info@ubumenyi.org' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 pt-12 pb-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Top section */}
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3">
              <Image
                src="/umukoro-logo.jpg"
                alt="Umukoro"
                width={110}
                height={30}
                className="h-8 w-auto"
              />
            </div>
            <p className="mb-3 text-xs leading-relaxed text-[#64748B]">
              Rwanda&apos;s centralized educational resource initiative. Organized, verified, and freely accessible.
            </p>
            <p className="text-[10px] font-medium text-[#94A3B8]">Kigali, Rwanda</p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                {group}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#64748B] transition-colors hover:text-[#0F172A]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row">
          <p className="text-xs text-[#94A3B8]">© 2026 Ubumenyi Educational Resource Initiative. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@ubumenyi.org"
              className="text-xs text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              info@ubumenyi.org
            </a>
            <div className="flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1">
              <svg className="h-3 w-3 text-[#3457A6]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-semibold text-[#3457A6]">Verified Content</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
