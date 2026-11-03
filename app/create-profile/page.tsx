'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Male',
    date_of_birth: '',
    occupation: '',
    city: '',
    state: '',
    about_me: '',
    partner_preference: '',
    instagram: '',
    linked_in: '',
  })

  useEffect(() => {
    async function loadExistingProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          gender: data.gender || 'Male',
          date_of_birth: data.date_of_birth || '',
          occupation: data.occupation || '',
          city: data.city || '',
          state: data.state || '',
          about_me: data.about_me || '',
          partner_preference: data.partner_preference || '',
          instagram: data.instagram || '',
          linked_in: data.linked_in || '',
        })
      }
    }
    loadExistingProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      alert('You must be logged in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      ...formData,
      updated_at: new Date(),
    })

    if (error) {
      alert('Error saving profile: ' + error.message)
    } else {
      router.push('/matches')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
              Your Biodata
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Create / Edit Profile
            </h1>
          </div>
          <Link href="/" className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors">
            ← Back to Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                required
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. Software Engineer, Doctor, Business"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="State"
              />
            </div>
          </div>

          {/* New Social Links Fields */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instagram Profile Link / Handle</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile Link</label>
              <input
                type="text"
                name="linked_in"
                value={formData.linked_in}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="linkedin.com/in/username"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">About Me</label>
            <textarea
              name="about_me"
              rows={3}
              value={formData.about_me}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Tell us about your background, hobbies, and interests..."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Partner Preferences</label>
            <textarea
              name="partner_preference"
              rows={3}
              value={formData.partner_preference}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="What are you looking for in a life partner?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Saving Profile...' : 'Save & Publish Profile'}
          </button>
        </form>
      </div>
    </main>
  )
}