'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ProfileContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendingInterest, setSendingInterest] = useState(false)
  const [interestStatus, setInterestStatus] = useState<string | null>(null)
  const [isBlurred, setIsBlurred] = useState(false)

  // Anti-screenshot: Blur sensitive screen content when window loses focus or user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setIsBlurred(true)
      else setIsBlurred(false)
    }
    const handleBlur = () => setIsBlurred(true)
    const handleFocus = () => setIsBlurred(false)

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setCurrentUser(session.user)
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (data) setProfile(data)
        if (error) console.error('Supabase error:', error.message)

        if (session?.user && session.user.id !== id) {
          const { data: sentInterest } = await supabase
            .from('interests')
            .select('status')
            .eq('sender_id', session.user.id)
            .eq('receiver_id', id)
            .maybeSingle()

          if (sentInterest) {
            setInterestStatus(sentInterest.status)
          } else {
            const { data: receivedInterest } = await supabase
              .from('interests')
              .select('status')
              .eq('sender_id', id)
              .eq('receiver_id', session.user.id)
              .maybeSingle()
            if (receivedInterest) setInterestStatus(receivedInterest.status)
          }
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [id])

  const handleSendInterest = async () => {
    if (!currentUser) {
      alert('Please log in to send an interest.')
      return
    }

    if (currentUser.id === id) {
      alert("You cannot send an interest to your own profile.")
      return
    }

    setSendingInterest(true)
    const { error } = await supabase.from('interests').insert({
      sender_id: currentUser.id,
      receiver_id: id,
      status: 'pending'
    })

    if (error) {
      alert('Error sending interest or already sent: ' + error.message)
    } else {
      setInterestStatus('pending')
      alert('Interest sent successfully! Awaiting consent acceptance.')
    }
    setSendingInterest(false)
  }

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

  const isOwner = currentUser?.id === profile.id
  const isConsentGranted = isOwner || interestStatus === 'accepted'

  const photosList = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : (profile.photo_url ? [profile.photo_url] : [])

  return (
    <main className={`min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center transition-all duration-300 ${isBlurred ? 'filter blur-2xl select-none' : ''}`}>
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6 relative overflow-hidden no-screenshot">
        
        {/* Dynamic Watermark to deter screenshots */}
        {currentUser && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 overflow-hidden z-50">
            <p className="text-slate-900 text-sm font-bold rotate-[-35deg] whitespace-nowrap">
              CONFIDENTIAL • VIEWED BY {currentUser.email} • IDLYVADA MATRIMONY
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            {isConsentGranted && photosList.length > 0 ? (
              <img src={photosList[0]} alt={profile.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 shadow-sm pointer-events-none" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] text-center p-1 border border-slate-200">
                🔒 Photo Locked
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
                  {profile.is_verified ? 'Verified Biodata ✓' : 'Biodata'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {profile.full_name}
                </h1>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  ID: {profile.id?.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <Link href="/matches" className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors">
            ← Back to Matches
          </Link>
        </div>

        {/* Contact & Consent Box */}
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span className="text-rose-700 font-semibold block uppercase tracking-wider">Mobile Number (Consent Required)</span>
            {isConsentGranted ? (
              <strong className="text-slate-900 text-sm font-mono">{profile.mobile_number || 'Not Provided'}</strong>
            ) : (
              <span className="text-slate-500 italic">🔒 Locked. Send interest & get acceptance to view phone number and photos.</span>
            )}
          </div>

          {!isOwner && (
            <button
              onClick={handleSendInterest}
              disabled={sendingInterest || interestStatus === 'pending' || interestStatus === 'accepted'}
              className={`px-5 py-2.5 rounded-xl font-medium text-xs shadow-sm transition-all ${
                interestStatus === 'accepted' ? 'bg-emerald-600 text-white cursor-default' :
                interestStatus === 'pending' ? 'bg-amber-500 text-white cursor-default' :
                'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
              }`}
            >
              {interestStatus === 'accepted' ? 'Connected ✓' :
               interestStatus === 'pending' ? 'Interest Pending ⏳' :
               sendingInterest ? 'Sending...' : '❤️ Send Interest'}
            </button>
          )}
        </div>

        {/* Gallery Photos Section */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Photo Gallery</h3>
          {isConsentGranted ? (
            <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {photosList.length > 0 ? (
                photosList.map((url: string, idx: number) => (
                  <img key={idx} src={url} alt="Gallery" className="w-full h-20 rounded-lg object-cover border border-slate-300 shadow-sm pointer-events-none" />
                ))
              ) : (
                <p className="text-slate-400 col-span-5 text-center py-2">No photos uploaded.</p>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-slate-500 italic">
              🔒 Photos are locked. Accept or receive an accepted interest to view member photos.
            </div>
          )}
        </div>

        {/* Public Personal Information */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Personal & Professional Information (Public)</h3>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Gender & Status</span>
              <strong className="text-slate-900 text-sm">{profile.gender} • {profile.marital_status || 'Never Married'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Date of Birth & Height</span>
              <strong className="text-slate-900 text-sm">{profile.date_of_birth} {profile.height ? `(${profile.height})` : ''}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Occupation</span>
              <strong className="text-slate-900 text-sm">{profile.occupation || 'Not Specified'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Present Location</span>
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

        {/* Public Religious Information */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Religious Information (Public)</h3>
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

        {/* Public Lifestyle & Family Details */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] text-rose-600">Lifestyle & Family Details (Public)</h3>
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

        {/* Public Bio & Partner Preferences */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">About Me (Public)</h3>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {profile.about_me || 'No information provided.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Partner Preferences (Public)</h3>
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