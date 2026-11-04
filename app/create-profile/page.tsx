'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const HEIGHT_OPTIONS = [
  "4ft 5in / 134 cm",
  "4ft 6in / 137 cm",
  "4ft 7in / 140 cm",
  "4ft 8in / 142 cm",
  "4ft 9in / 144 cm",
  "4ft 10in / 147 cm",
  "4ft 11in / 150 cm",
  "5ft / 152 cm",
  "5ft 1in / 154 cm",
  "5ft 2in / 157 cm",
  "5ft 3in / 160 cm",
  "5ft 4in / 162 cm",
  "5ft 5in / 165 cm",
  "5ft 6in / 168 cm",
  "5ft 7in / 170 cm",
  "5ft 8in / 172 cm",
  "5ft 9in / 175 cm",
  "5ft 10in / 177 cm",
  "5ft 11in / 180 cm",
  "6ft / 182 cm",
  "6ft 1in / 185 cm",
  "6ft 2in / 187 cm",
  "6ft 3in / 190 cm",
  "6ft 4in / 193 cm",
  "6ft 5in / 195 cm"
]

export default function CreateProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Male',
    date_of_birth: '',
    height: '5ft 6in / 168 cm',
    occupation: '',
    city: '',
    state: '',
    present_location: '',
    mobile_number: '',
    about_me: '',
    partner_preference: '',
    instagram: '',
    linked_in: '',
    caste: '',
    subcaste: '',
    mother_tongue: 'Telugu',
    marital_status: 'Never Married',
    kuja_dosham: 'No',
    eating_habits: 'Vegetarian',
    smoking_habits: 'Non-smoker',
    drinking_habits: 'Non-drinker',
    family_type: 'Nuclear Family',
    family_status: 'Middle Class',
    father_occupation: '',
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
          height: data.height || '5ft 6in / 168 cm',
          occupation: data.occupation || '',
          city: data.city || '',
          state: data.state || '',
          present_location: data.present_location || '',
          mobile_number: data.mobile_number || '',
          about_me: data.about_me || '',
          partner_preference: data.partner_preference || '',
          instagram: data.instagram || '',
          linked_in: data.linked_in || '',
          caste: data.caste || '',
          subcaste: data.subcaste || '',
          mother_tongue: data.mother_tongue || 'Telugu',
          marital_status: data.marital_status || 'Never Married',
          kuja_dosham: data.kuja_dosham || 'No',
          eating_habits: data.eating_habits || 'Vegetarian',
          smoking_habits: data.smoking_habits || 'Non-smoker',
          drinking_habits: data.drinking_habits || 'Non-drinker',
          family_type: data.family_type || 'Nuclear Family',
          family_status: data.family_status || 'Middle Class',
          father_occupation: data.father_occupation || '',
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
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
              Comprehensive Biodata
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Create / Edit Profile
            </h1>
          </div>
          <Link href="/" className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors">
            ← Back to Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Basic Details & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile_number"
                  required
                  value={formData.mobile_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="+91 9876543210"
                />
              </div>
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
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Height</label>
                <select
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {HEIGHT_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Marital Status</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Profession */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Location & Professional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Software Engineer, Doctor"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mother Tongue</label>
                <input
                  type="text"
                  name="mother_tongue"
                  value={formData.mother_tongue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Telugu"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Present Location (Lives In)</label>
                <input
                  type="text"
                  name="present_location"
                  value={formData.present_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Hyderabad, Telangana"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Native City / State</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Religious Background */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Religious Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Caste</label>
                <input
                  type="text"
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Caste"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subcaste</label>
                <input
                  type="text"
                  name="subcaste"
                  value={formData.subcaste}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Subcaste"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kuja Dosham</label>
                <select
                  name="kuja_dosham"
                  value={formData.kuja_dosham}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Don't Know">Don't Know</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifestyle & Family */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Lifestyle & Family Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Eating Habits</label>
                <select
                  name="eating_habits"
                  value={formData.eating_habits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-vegetarian">Non-vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Smoking</label>
                <select
                  name="smoking_habits"
                  value={formData.smoking_habits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Smoker">Smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Drinking</label>
                <select
                  name="drinking_habits"
                  value={formData.drinking_habits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Non-drinker">Non-drinker</option>
                  <option value="Drinker">Drinker</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Family Type</label>
                <select
                  name="family_type"
                  value={formData.family_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Nuclear Family">Nuclear Family</option>
                  <option value="Joint Family">Joint Family</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Family Status</label>
                <select
                  name="family_status"
                  value={formData.family_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Middle Class">Middle Class</option>
                  <option value="Upper Middle Class">Upper Middle Class</option>
                  <option value="Rich / Affluent">Rich / Affluent</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Father's Occupation</label>
                <input
                  type="text"
                  name="father_occupation"
                  value={formData.father_occupation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Father's job"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles (Optional) */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Social Profiles (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instagram Link / Handle</label>
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
          </div>

          {/* About Me & Partner Preferences */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Bio & Partner Preferences</h3>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">About Me</label>
              <textarea
                name="about_me"
                rows={3}
                value={formData.about_me}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Share your background, education, and interests..."
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
                placeholder="What qualities and preferences are you looking for in a partner?"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Saving Profile...' : 'Save & Publish Comprehensive Biodata'}
          </button>
        </form>
      </div>
    </main>
  )
}