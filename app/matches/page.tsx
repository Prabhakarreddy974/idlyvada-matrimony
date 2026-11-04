'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Helper to calculate age from date of birth
function calculateAge(dob: string) {
  if (!dob) return ''
  const diff = Date.now() - new Date(dob).getTime()
  const ageDate = new Date(diff)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        let currentUserGender = 'Male'
        let currentUserId = ''

        if (session?.user) {
          currentUserId = session.user.id
          const { data: myProfile } = await supabase
            .from('profiles')
            .select('gender')
            .eq('id', currentUserId)
            .maybeSingle()
          
          if (myProfile?.gender) {
            currentUserGender = myProfile.gender
          }
        }

        const targetGender = currentUserGender === 'Male' ? 'Female' : 'Male'

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', targetGender)
          .neq('id', currentUserId)
          .order('created_at', { ascending: false })

        if (data) {
          setProfiles(data)
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

    fetchProfiles()
  }, [])

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.present_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading compatible matches...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
              Verified Matches
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Compatible Profiles
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, location, or occupation..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProfiles.length === 0 ? (
            <p className="text-sm text-slate-500 col-span-2 text-center py-8">No matching opposite-gender profiles found yet. Try creating or editing a profile with the opposite gender!</p>
          ) : (
            filteredProfiles.map((profile) => {
              const age = calculateAge(profile.date_of_birth)
              return (
                <div key={profile.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
                  
                  {/* Split Layout: Left Side Photo, Right Side Details */}
                  <div className="flex gap-4 items-start">
                    
                    {/* Left Column: Larger Photo */}
                    <div className="flex-shrink-0">
                      {profile.photo_url ? (
                        <img 
                          src={profile.photo_url} 
                          alt={profile.full_name} 
                          className="w-24 h-32 rounded-xl object-cover border border-slate-200 shadow-sm" 
                        />
                      ) : (
                        <div className="w-24 h-32 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-200">
                          No Photo
                        </div>
                      )}
                    </div>

                    {/* Right Column: Profile Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{profile.full_name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">ID: {profile.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-50 text-rose-600">
                          {profile.gender}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <p className="font-semibold text-slate-900">
                          {age ? `${age} Yrs` : 'Age N/A'} {profile.height ? `• ${profile.height}` : ''}
                        </p>
                        <p className="text-slate-600">
                          💼 {profile.occupation || 'Occupation N/A'}
                        </p>
                        <p className="text-slate-500">
                          📍 {profile.present_location || `${profile.city}, ${profile.state}` || 'Location N/A'}
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {profile.about_me || 'No description provided.'}
                      </p>
                    </div>

                  </div>

                  {/* View Full Biodata Button */}
                  <Link
                    href={`/profile?id=${profile.id}`}
                    className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-800 text-center font-medium text-xs transition-all block"
                  >
                    View Full Biodata →
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}