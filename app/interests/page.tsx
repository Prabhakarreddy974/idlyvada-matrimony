'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function InterestsPage() {
  const [receivedInterests, setReceivedInterests] = useState<any[]>([])
  const [sentInterests, setSentInterests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInterests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setLoading(false)
        return
      }

      const userId = session.user.id

      // Fetch interests received by me
      const { data: received } = await supabase
        .from('interests')
        .select(`
          id,
          status,
          created_at,
          sender:sender_id (
            id,
            full_name,
            gender,
            date_of_birth,
            height,
            occupation,
            present_location,
            city,
            state,
            mobile_number
          )
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })

      if (received) setReceivedInterests(received)

      // Fetch interests sent by me
      const { data: sent } = await supabase
        .from('interests')
        .select(`
          id,
          status,
          created_at,
          receiver:receiver_id (
            id,
            full_name,
            gender,
            date_of_birth,
            height,
            occupation,
            present_location,
            city,
            state,
            mobile_number
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })

      if (sent) setSentInterests(sent)

    } catch (err) {
      console.error('Error fetching interests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterests()
  }, [])

  const handleUpdateStatus = async (interestId: string, newStatus: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('interests')
      .update({ status: newStatus })
      .eq('id', interestId)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      fetchInterests()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading your interests inbox...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
              Connections Hub
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Interests Inbox
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Interests Received */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Interests Received ({receivedInterests.length})
          </h2>

          {receivedInterests.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
              No interests received yet.
            </div>
          ) : (
            receivedInterests.map((item) => {
              const sender = item.sender
              return (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{sender?.full_name || 'Member'}</h3>
                      <p className="text-xs text-slate-500">
                        {sender?.occupation || 'Occupation N/A'} • {sender?.present_location || `${sender?.city}, ${sender?.state}`}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                      item.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.status === 'accepted' && (
                    <div className="space-y-2 pt-2">
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 flex justify-between items-center">
                        <span>Contact Number Unlocked:</span>
                        <strong className="font-mono text-sm">{sender?.mobile_number || 'Not Provided'}</strong>
                      </div>
                      <Link
                        href={`/chat?to=${sender?.id}`}
                        className="w-full py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-center font-medium text-xs transition-all block shadow-sm"
                      >
                        💬 Open Chat Conversation →
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <Link
                      href={`/profile?id=${sender?.id}`}
                      className="flex-1 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-medium text-xs transition-all block"
                    >
                      View Biodata →
                    </Link>

                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'accepted')}
                          className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-all cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'rejected')}
                          className="flex-1 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Interests Sent */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Interests Sent ({sentInterests.length})
          </h2>

          {sentInterests.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
              You have not sent any interests yet. Browse matches to connect!
            </div>
          ) : (
            sentInterests.map((item) => {
              const receiver = item.receiver
              return (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{receiver?.full_name || 'Member'}</h3>
                      <p className="text-xs text-slate-500">
                        {receiver?.occupation || 'Occupation N/A'} • {receiver?.present_location || `${receiver?.city}, ${receiver?.state}`}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                      item.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.status === 'accepted' && (
                    <div className="space-y-2 pt-2">
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 flex justify-between items-center">
                        <span>Contact Number Unlocked:</span>
                        <strong className="font-mono text-sm">{receiver?.mobile_number || 'Not Provided'}</strong>
                      </div>
                      <Link
                        href={`/chat?to=${receiver?.id}`}
                        className="w-full py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-center font-medium text-xs transition-all block shadow-sm"
                      >
                        💬 Open Chat Conversation →
                      </Link>
                    </div>
                  )}

                  <Link
                    href={`/profile?id=${receiver?.id}`}
                    className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-medium text-xs transition-all block"
                  >
                    View Biodata →
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