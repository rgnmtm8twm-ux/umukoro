'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3457A6]">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Ubumenyi</p>
            <p className="text-xs text-[#94A3B8]">Admin Portal</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
          <h1 className="mb-1 text-lg font-semibold text-[#0F172A]">Sign in</h1>
          <p className="mb-6 text-sm text-[#64748B]">Access the resource management dashboard</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-[#3457A6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96] disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Ubumenyi Educational Resource Initiative
        </p>
      </div>
    </div>
  )
}
