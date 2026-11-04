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
  const [uploading, setUploading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

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
    photo_url: '',
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
          photo_url: data.photo_url || '',
        })
      }
    }
    loadExistingProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle standard photo upload from file picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }))
      alert('Photo uploaded successfully!')
    } catch (error: any) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Start browser camera for live selfie verification
  const startCamera = async () => {
    setCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoElement = document.getElementById('selfie-video') as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = stream
      }
    } catch (err) {
      alert('Unable to access camera. Please check your browser permissions.')
      setCameraActive(false)
    }
  }

  // Capture frame from webcam and upload as live selfie
  const captureSelfie = () => {
    const videoElement = document.getElementById('selfie-video') as HTMLVideoElement
    if (!videoElement) return

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth || 320
    canvas.height = videoElement.videoHeight || 240
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'live-selfie.jpg', { type: 'image/jpeg' })
        
        const fileName = `selfie-${Math.random()}.jpg`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
        
        if (uploadError) {
          alert('Error uploading selfie: ' + uploadError.message)
          return
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        
        setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }))
        
        // Stop camera stream
        const stream = videoElement.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        setCameraActive(false)
        alert('Live selfie verified & uploaded successfully!')
      }, 'image/jpeg')
    }
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
              Comprehensive Biodata & Verification
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
          
          {/* Profile Photo & Live Selfie Section */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Profile Photo & Verified Selfie</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border-2 border-rose-500 shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  No Photo
                </div>
              )}
              
              <div className="space-y-2 flex-1 w-full">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Upload Photo from Device</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                  />
                  {uploading && <span className="text-rose-600 text-[10px]">Uploading photo...</span>}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  {!cameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-all cursor-pointer"
                    >
                      📸 Take Live Selfie Verification
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <video id="selfie-video" autoPlay playsInline className="w-full max-w-xs rounded-xl border border-slate-300"></video>
                      <button
                        type="button"
                        onClick={captureSelfie}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs transition-all cursor-pointer block"
                      >
                        Capture & Verify Selfie Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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

          {/* Social Profiles */}
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
                className="w-full px-3py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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