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
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading Idlyvada Matrimony...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6">
        
        <div>
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
            Trusted Matrimony Platform
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
            Find Your Perfect Life Partner with <span className="text-rose-600">Idlyvada Matrimony</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            A secure, modern, and dedicated space designed to help you connect with verified profiles and begin your journey together.
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              Signed in as: <strong className="text-rose-600">{user.email}</strong>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/create-profile"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-md transition-all block"
              >
                Create / Edit Profile
              </Link>
              <Link
                href="/matches"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-md transition-all block"
              >
                Browse Matches
              </Link>
              <Link
                href="/interests"
                className="w-full py-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-medium text-xs border border-pink-200 shadow-sm transition-all flex items-center justify-center gap-2 block"
              >
                ❤️ Interests Received
              </Link>
            </div>

            <button
              onClick={handleSignOut}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors pt-2 block mx-auto cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-md transition-all block"
            >
              Sign In / Register
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}