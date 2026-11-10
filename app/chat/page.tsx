'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ChatContent() {
  const searchParams = useSearchParams()
  const receiverId = searchParams.get('to')

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [receiverProfile, setReceiverProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initChat() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setLoading(false)
        return
      }
      setCurrentUser(session.user)

      if (receiverId) {
        // Fetch receiver's profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, photo_url, photos')
          .eq('id', receiverId)
          .maybeSingle()
        if (profileData) setReceiverProfile(profileData)

        // Fetch existing messages between current user and receiver
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`)
          .order('created_at', { ascending: true })

        if (msgData) setMessages(msgData)
      } else {
        // Fetch accepted interests/connections to show in the inbox list
        const { data: sentInterests } = await supabase
          .from('interests')
          .select('receiver_id')
          .eq('sender_id', session.user.id)
          .eq('status', 'accepted')

        const { data: receivedInterests } = await supabase
          .from('interests')
          .select('sender_id')
          .eq('receiver_id', session.user.id)
          .eq('status', 'accepted')

        const connectedIds = [
          ...(sentInterests?.map(i => i.receiver_id) || []),
          ...(receivedInterests?.map(i => i.sender_id) || [])
        ]

        if (connectedIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, photo_url, photos')
            .in('id', connectedIds)

          if (profilesData) setConversations(profilesData)
        }
      }
      setLoading(false)
    }

    initChat()

    // Subscribe to real-time incoming messages if chatting with someone
    if (receiverId) {
      const channel = supabase
        .channel('realtime-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const incoming = payload.new
            if (
              (incoming.sender_id === receiverId && incoming.receiver_id === currentUser?.id) ||
              (incoming.sender_id === currentUser?.id && incoming.receiver_id === receiverId)
            ) {
              setMessages((prev) => [...prev, incoming])
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [receiverId, currentUser?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !receiverId) return

    const contentText = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: contentText,
    })

    if (error) {
      alert('Error sending message: ' + error.message)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading chat...</p>
      </main>
    )
  }

  // If no recipient is selected, show the Conversations Inbox
  if (!receiverId) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-slate-100 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h1 className="text-base font-bold text-slate-900">💬 Messages & Conversations</h1>
            <Link href="/" className="text-xs text-rose-600 font-medium hover:underline">← Home</Link>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-slate-500">No active conversations yet.</p>
              <p className="text-[11px] text-slate-400">Accept interests or connect with matches to start messaging.</p>
              <Link href="/matches" className="inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium">
                Browse Matches
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((person) => {
                const avatar = person.photo_url || (person.photos && person.photos[0])
                return (
                  <Link
                    key={person.id}
                    href={`/chat?to=${person.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all block"
                  >
                    {avatar ? (
                      <img src={avatar} alt={person.full_name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {person.full_name?.charAt(0) || 'M'}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xs font-bold text-slate-900">{person.full_name}</h2>
                      <span className="text-[10px] text-rose-600 font-medium">Tap to open chat →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    )
  }

  // Active Chat Screen with selected recipient
  const receiverAvatar = receiverProfile?.photo_url || (receiverProfile?.photos && receiverProfile.photos[0])

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col h-[80vh]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            {receiverAvatar ? (
              <img src={receiverAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                {receiverProfile?.full_name?.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-slate-900">{receiverProfile?.full_name || 'Member'}</h2>
              <span className="text-[10px] text-emerald-600 font-medium">● Online</span>
            </div>
          </div>
          <Link href="/chat" className="text-xs text-slate-600 hover:text-rose-600">
            ← Back to Inbox
          </Link>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No messages yet. Say hello and start the conversation! 👋
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    isMe 
                      ? 'bg-rose-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                    <p className="text-xs leading-relaxed">{msg.content}</p>
                    <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-rose-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-all cursor-pointer"
          >
            Send
          </button>
        </form>

      </div>
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm text-slate-500">Loading chat...</p></div>}>
      <ChatContent />
    </Suspense>
  )
}