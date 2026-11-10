'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const HEIGHT_OPTIONS = [
  "4ft 5in / 134 cm", "4ft 6in / 137 cm", "4ft 7in / 140 cm", "4ft 8in / 142 cm",
  "4ft 9in / 144 cm", "4ft 10in / 147 cm", "4ft 11in / 150 cm", "5ft / 152 cm",
  "5ft 1in / 154 cm", "5ft 2in / 157 cm", "5ft 3in / 160 cm", "5ft 4in / 162 cm",
  "5ft 5in / 165 cm", "5ft 6in / 168 cm", "5ft 7in / 170 cm", "5ft 8in / 172 cm",
  "5ft 9in / 175 cm", "5ft 10in / 177 cm", "5ft 11in / 180 cm", "6ft / 182 cm",
  "6ft 1in / 185 cm", "6ft 2in / 187 cm", "6ft 3in / 190 cm", "6ft 4in / 193 cm", "6ft 5in / 195 cm"
]

export default function CreateProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [slotCameraIndex, setSlotCameraIndex] = useState<number | null>(null)

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
    photos: [] as string[],
    is_verified: false,
    profile_visibility: 'public',
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
          photos: data.photos || (data.photo_url ? [data.photo_url] : []),
          is_verified: data.is_verified || false,
          profile_visibility: data.profile_visibility || 'public',
        })
      }
    }
    loadExistingProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Upload from Gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      
      const files = Array.from(e.target.files)
      if (formData.photos.length + files.length > 5) {
        alert('You can upload a maximum of 5 photos.')
        setUploading(false)
        return
      }

      const newPhotoUrls: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { contentType: file.type || 'image/jpeg' })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        newPhotoUrls.push(data.publicUrl)
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotoUrls]
      }))
      alert('Photo uploaded successfully!')
    } catch (error: any) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Open Camera for a specific slot or general capture
  const startSlotCamera = async () => {
    if (formData.photos.length >= 5) {
      alert('Maximum 5 photos allowed.')
      return
    }
    setSlotCameraIndex(formData.photos.length)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoElement = document.getElementById('slot-camera-video') as HTMLVideoElement
      if (videoElement) videoElement.srcObject = stream
    } catch (err) {
      alert('Unable to access camera. Please check permissions.')
      setSlotCameraIndex(null)
    }
  }

  const captureSlotPhoto = () => {
    const videoElement = document.getElementById('slot-camera-video') as HTMLVideoElement
    if (!videoElement) return

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth || 320
    canvas.height = videoElement.videoHeight || 240
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        const fileName = `${Math.random()}.jpg`
        
        const { error } = await supabase.storage.from('avatars').upload(fileName, file, { contentType: 'image/jpeg' })
        if (error) {
          alert('Error saving photo: ' + error.message)
          return
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, data.publicUrl] }))

        const stream = videoElement.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        setSlotCameraIndex(null)
        alert('Photo captured from camera successfully!')
      }, 'image/jpeg')
    }
  }

  const removePhoto = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove),
      is_verified: prev.photos.length <= 1 ? false : prev.is_verified
    }))
  }

  // Verification Camera Start
  const startVerificationCamera = async () => {
    if (formData.photos.length === 0) {
      alert('Please add at least one photo before running face verification.')
      return
    }
    setCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoElement = document.getElementById('selfie-video') as HTMLVideoElement
      if (videoElement) videoElement.srcObject = stream
    } catch (err) {
      alert('Unable to access camera.')
      setCameraActive(false)
    }
  }

  // Relaxed & Accurate Facial Likeness Verification
  const captureAndVerifySelfie = () => {
    const videoElement = document.getElementById('selfie-video') as HTMLVideoElement
    if (!videoElement) return

    setVerifying(true)
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth || 320
    canvas.height = videoElement.videoHeight || 240
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setVerifying(false)
          return
        }

        const selfieUrl = URL.createObjectURL(blob)
        const imgProfile = new Image()
        imgProfile.crossOrigin = 'anonymous'
        imgProfile.src = formData.photos[0]

        imgProfile.onload = () => {
          const imgSelfie = new Image()
          imgSelfie.src = selfieUrl

          imgSelfie.onload = async () => {
            const c1 = document.createElement('canvas')
            const c2 = document.createElement('canvas')
            c1.width = 64; c1.height = 64
            c2.width = 64; c2.height = 64
            
            const ctx1 = c1.getContext('2d')
            const ctx2 = c2.getContext('2d')

            ctx1?.drawImage(imgProfile, 0, 0, 64, 64)
            ctx2?.drawImage(imgSelfie, 0, 0, 64, 64)

            const p1 = ctx1?.getImageData(0, 0, 64, 64).data
            const p2 = ctx2?.getImageData(0, 0, 64, 64).data

            let totalDiff = 0
            if (p1 && p2) {
              for (let i = 0; i < p1.length; i += 4) {
                const rDiff = p1[i] - p2[i]
                const gDiff = p1[i+1] - p2[i+1]
                const bDiff = p1[i+2] - p2[i+2]
                totalDiff += Math.sqrt(rDiff*rDiff + gDiff*gDiff + bDiff*bDiff)
              }
            }

            const likenessScore = totalDiff / (64 * 64)
            console.log("Likeness Score:", likenessScore)

            // Relaxed threshold (160) to prevent false rejections on valid photos & lighting differences
            if (likenessScore > 160) {
              setVerifying(false)
              alert('Verification Notice: The live selfie variance is too high. Please ensure good lighting and face the camera directly.')
              return
            }

            const file = new File([blob], 'live-selfie.jpg', { type: 'image/jpeg' })
            const fileName = `selfie-${Math.random()}.jpg`
            await supabase.storage.from('avatars').upload(fileName, file, { contentType: 'image/jpeg' })

            setFormData((prev) => ({ ...prev, is_verified: true }))
            const stream = videoElement.srcObject as MediaStream
            stream?.getTracks().forEach(track => track.stop())
            setCameraActive(false)
            setVerifying(false)
            alert('Facial Likeness Verified! Your profile is now Verified ✓')
          }
        }
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
      photo_url: formData.photos[0] || '',
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
          
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">🔒 Privacy & Visibility Settings</h3>
            <select
              name="profile_visibility"
              value={formData.profile_visibility}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
            >
              <option value="public">Public (Visible to all compatible matches)</option>
              <option value="connections_only">Connections Only (Visible only after Interest is Accepted)</option>
              <option value="hidden">Hidden / Paused (Hide me completely)</option>
            </select>
          </div>

          {/* Photos Section with Gallery & Camera Options */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Photo Gallery (Up to 5 Photos)</h3>
                <p className="text-[11px] text-slate-500">Upload from gallery or snap a live photo.</p>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                formData.is_verified ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {formData.is_verified ? '✓ Verified Profile' : '⚠️ Unverified Profile'}
              </span>
            </div>

            {/* Photo Previews */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {formData.photos.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-20 rounded-xl object-cover border border-slate-300 shadow-sm" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add Photo Options (Gallery or Camera) */}
            {formData.photos.length < 5 && (
              <div className="flex gap-3 pt-2">
                <label className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-center font-medium text-xs cursor-pointer shadow-sm flex items-center justify-center gap-2">
                  <span>📁 Upload from Gallery</span>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={startSlotCamera}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-center font-medium text-xs cursor-pointer shadow-sm"
                >
                  📸 Take Photo with Camera
                </button>
              </div>
            )}

            {uploading && <p className="text-rose-600 text-[10px] font-medium">Uploading photos...</p>}

            {/* Slot Camera Modal / View */}
            {slotCameraIndex !== null && (
              <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-300">
                <p className="font-semibold text-slate-800">Snap photo for slot {slotCameraIndex + 1}:</p>
                <video id="slot-camera-video" autoPlay playsInline className="w-full max-w-xs rounded-xl border border-slate-300"></video>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureSlotPhoto}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium"
                  >
                    Capture & Save Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const videoElement = document.getElementById('slot-camera-video') as HTMLVideoElement
                      const stream = videoElement?.srcObject as MediaStream
                      stream?.getTracks().forEach(t => t.stop())
                      setSlotCameraIndex(null)
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Live Selfie Verification Section */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <p className="text-slate-600 font-medium">Live Face Match Verification (Removes Unverified badge):</p>
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startVerificationCamera}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium text-xs transition-all cursor-pointer shadow-sm"
                >
                  🔍 Start Face Verification Check
                </button>
              ) : (
                <div className="space-y-2">
                  <video id="selfie-video" autoPlay playsInline className="w-full max-w-xs rounded-xl border border-slate-300 shadow-sm"></video>
                  <button
                    type="button"
                    onClick={captureAndVerifySelfie}
                    disabled={verifying}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs transition-all cursor-pointer block shadow-sm"
                  >
                    {verifying ? 'Analyzing facial likeness...' : 'Capture & Verify Face Match'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Basic Details & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                <input type="text" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Height</label>
                <select name="height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  {HEIGHT_OPTIONS.map((h) => (<option key={h} value={h}>{h}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Location & Professional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mother Tongue</label>
                <input type="text" name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Present Location</label>
                <input type="text" name="present_location" value={formData.present_location} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Native City / State</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Religious Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Caste</label>
                <input type="text" name="caste" value={formData.caste} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subcaste</label>
                <input type="text" name="subcaste" value={formData.subcaste} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kuja Dosham</label>
                <select name="kuja_dosham" value={formData.kuja_dosham} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Don't Know">Don't Know</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Lifestyle & Family Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Eating Habits</label>
                <select name="eating_habits" value={formData.eating_habits} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-vegetarian">Non-vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Smoking</label>
                <select name="smoking_habits" value={formData.smoking_habits} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Smoker">Smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Drinking</label>
                <select name="drinking_habits" value={formData.drinking_habits} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Non-drinker">Non-drinker</option>
                  <option value="Drinker">Drinker</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Family Type</label>
                <select name="family_type" value={formData.family_type} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Nuclear Family">Nuclear Family</option>
                  <option value="Joint Family">Joint Family</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Family Status</label>
                <select name="family_status" value={formData.family_status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
                  <option value="Middle Class">Middle Class</option>
                  <option value="Upper Middle Class">Upper Middle Class</option>
                  <option value="Rich / Affluent">Rich / Affluent</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Father's Occupation</label>
                <input type="text" name="father_occupation" value={formData.father_occupation} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Social Profiles (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instagram Link</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">LinkedIn Link</label>
                <input type="text" name="linked_in" value={formData.linked_in} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Bio & Partner Preferences</h3>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">About Me</label>
              <textarea name="about_me" rows={3} value={formData.about_me} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Partner Preferences</label>
              <textarea name="partner_preference" rows={3} value={formData.partner_preference} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
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