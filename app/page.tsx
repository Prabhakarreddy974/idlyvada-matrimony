'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check current auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading Idlyvada Matrimony...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-2xl space-y-6">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
          Trusted Matrimony Platform
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Find Your Perfect Life Partner with <span className="text-rose-600">Idlyvada Matrimony</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          A secure, modern, and dedicated space designed to help you connect with verified profiles and begin your journey together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm font-medium text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                Signed in as: <strong className="text-rose-600">{user.email}</strong>
              </span>
              <button
                onClick={handleSignOut}
                className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-lg shadow-rose-600/20 transition-all"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}