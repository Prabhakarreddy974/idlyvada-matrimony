'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ViewProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading profile details...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-sm text-slate-500">Profile not found.</p>
        <Link href="/matches" className="text-rose-600 text-xs font-medium hover:underline">← Back to Matches</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
              Biodata Details
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              {profile.full_name}
            </h1>
          </div>
          <Link
            href="/matches"
            className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
          >
            ← Back to Matches
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Gender</span>
            <strong className="text-slate-900 text-sm">{profile.gender}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Date of Birth</span>
            <strong className="text-slate-900 text-sm">{profile.date_of_birth}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Occupation</span>
            <strong className="text-slate-900 text-sm">{profile.occupation}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Location</span>
            <strong className="text-slate-900 text-sm">{profile.city}, {profile.state}</strong>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">About Me</h3>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {profile.about_me || 'No information provided.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Partner Preferences</h3>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {profile.partner_preference || 'No preferences specified.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}