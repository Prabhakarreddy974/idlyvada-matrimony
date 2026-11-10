'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading Idlyvada Matrimony...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6 text-center">
        
        {/* Badge */}
        <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100 inline-block">
          Trusted Matrimony Platform
        </span>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            Find Your Perfect Life Partner with <span className="text-rose-600">Idlyvada Matrimony</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            A secure, modern, and dedicated space designed to help you connect with verified profiles and begin your journey together.
          </p>
        </div>

        {session ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
              Signed in as: <strong className="text-slate-900">{session.user.email}</strong>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/create-profile"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-center font-semibold text-sm transition-all block shadow-sm shadow-rose-200"
              >
                Create / Edit Profile
              </Link>

              <Link
                href="/matches"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-center font-semibold text-sm transition-all block shadow-sm"
              >
                Browse Matches
              </Link>

              <Link
                href="/interests"
                className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-center font-semibold text-sm transition-all block border border-rose-100"
              >
                ❤️ Interests Received
              </Link>

              <Link
                href="/chat"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-semibold text-sm transition-all block border border-slate-200"
              >
                💬 Messages & Chats
              </Link>
            </div>

            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors pt-2 block mx-auto underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-center font-semibold text-sm transition-all block shadow-sm shadow-rose-200"
            >
              Sign In / Register
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}