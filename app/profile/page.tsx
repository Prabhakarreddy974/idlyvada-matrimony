'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ProfileContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (data) {
          setProfile(data)
        }
        if (error) {
          console.error('Supabase error:', error.message)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
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
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
              Verified Biodata
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {profile.full_name}
              </h1>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                ID: {profile.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
          <Link
            href="/matches"
            className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
          >
            ← Back to Matches
          </Link>
        </div>

        {/* Contact Information Box */}
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span className="text-rose-700 font-semibold block uppercase tracking-wider">Contact Number</span>
            <strong className="text-slate-900 text-sm font-mono">{profile.mobile_number || 'Not Provided'}</strong>
          </div>
          <a
            href={`tel:${profile.mobile_number}`}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-sm transition-all"
          >
            📞 Call Member
          </a>
        </div>

        {/* Basic Details Grid */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Personal & Professional Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Gender & Status</span>
              <strong className="text-slate-900 text-sm">{profile.gender} • {profile.marital_status || 'Never Married'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Date of Birth</span>
              <strong className="text-slate-900 text-sm">{profile.date_of_birth}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Occupation</span>
              <strong className="text-slate-900 text-sm">{profile.occupation || 'Not Specified'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Present Location (Lives In)</span>
              <strong className="text-slate-900 text-sm">{profile.present_location || 'Not Specified'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Native City / State</span>
              <strong className="text-slate-900 text-sm">{profile.city}, {profile.state}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Mother Tongue</span>
              <strong className="text-slate-900 text-sm">{profile.mother_tongue || 'Telugu'}</strong>
            </div>
          </div>
        </div>

        {/* Religious Information */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Religious Information</h3>
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Caste</span>
              <strong className="text-slate-900 text-sm">{profile.caste || 'Not Specified'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Subcaste</span>
              <strong className="text-slate-900 text-sm">{profile.subcaste || 'Not Specified'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Kuja Dosham</span>
              <strong className="text-slate-900 text-sm">{profile.kuja_dosham || 'No'}</strong>
            </div>
          </div>
        </div>

        {/* Lifestyle & Family */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Lifestyle & Family Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Eating Habits</span>
              <strong className="text-slate-900 text-sm">{profile.eating_habits || 'Vegetarian'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Smoking</span>
              <strong className="text-slate-900 text-sm">{profile.smoking_habits || 'Non-smoker'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Drinking</span>
              <strong className="text-slate-900 text-sm">{profile.drinking_habits || 'Non-drinker'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Family Type & Status</span>
              <strong className="text-slate-900 text-sm">{profile.family_type} ({profile.family_status})</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Father's Occupation</span>
              <strong className="text-slate-900 text-sm">{profile.father_occupation || 'Not Specified'}</strong>
            </div>
          </div>
        </div>

        {/* Social Profiles Section */}
        {(profile.instagram || profile.linked_in) && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">Social Profiles</h3>
            <div className="flex flex-wrap gap-3">
              {profile.instagram && (
                <a
                  href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 font-medium text-xs border border-pink-100 transition-all flex items-center gap-2"
                >
                  📸 Instagram Profile →
                </a>
              )}
              {profile.linked_in && (
                <a
                  href={profile.linked_in.startsWith('http') ? profile.linked_in : `https://${profile.linked_in}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs border border-blue-100 transition-all flex items-center gap-2"
                >
                  💼 LinkedIn Profile →
                </a>
              )}
            </div>
          </div>
        )}

        {/* About & Partner Preferences */}
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

export default function ViewProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm text-slate-500">Loading...</p></div>}>
      <ProfileContent />
    </Suspense>
  )
}