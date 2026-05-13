'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navLinks = [
  { label: 'Mission', href: '/#mission' },
  { label: 'Resources', href: '/resources' },
  { label: 'Assessments', href: '/assessments' },
  { label: 'Contributors', href: '/contributors' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/umukoro-logo.jpg"
            alt="Umukoro"
            width={130}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm text-[#334155] transition-colors hover:bg-[#F8FAFC]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#3457A6]">
                  {user.email?.[0].toUpperCase() ?? 'U'}
                </div>
                <svg className="h-3.5 w-3.5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-lg">
                  <div className="border-b border-[#F1F5F9] px-3 py-2">
                    <p className="max-w-full truncate text-xs text-[#94A3B8]">{user.email}</p>
                  </div>
                  <Link
                    href="/profile/attempts"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#334155] hover:bg-[#F8FAFC]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg className="h-4 w-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Attempts
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
              >
                Sign in
              </Link>
              <Link
                href="/#partner"
                className="rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
              >
                Partner with us
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="flex flex-col gap-1.5 sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-[#334155] transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-5 bg-[#334155] transition-opacity ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-5 bg-[#334155] transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#64748B]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile/attempts"
                  className="text-sm text-[#64748B]"
                  onClick={() => setOpen(false)}
                >
                  My Attempts
                </Link>
                <button
                  onClick={handleSignOut}
                  className="mt-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-left text-sm font-semibold text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#64748B]"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/#partner"
                  className="mt-1 rounded-lg bg-[#3457A6] px-4 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Partner with us
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
