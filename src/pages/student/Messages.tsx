import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { Conversation, Message } from '../../types'
import { avatarFor } from '../../lib/avatar'

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [thread, setThread] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Conversation[]>('/conversations')
      .then((convos) => {
        setConversations(convos)
        if (convos.length > 0) setActiveId(convos[0].id)
      })
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeId) return
    api
      .get<Message[]>(`/conversations/${activeId}/messages`)
      .then(setThread)
      .catch(() => setThread([]))
  }, [activeId])

  const activeConversation = conversations.find((c) => c.id === activeId)

  const handleSend = async () => {
    if (!draft.trim() || !activeId) return
    const text = draft.trim()
    setDraft('')
    setError('')
    try {
      const message = await api.post<Message>(`/conversations/${activeId}/messages`, { text })
      setThread((prev) => [...prev, message])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send that message.')
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
        Loading conversations...
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-slate-500">
          No conversations yet. Visit a tutor's profile and click "Message" to start one.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[240px_1fr]">
      <div className="border-b border-slate-200 md:border-b-0 md:border-r">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left ${
              activeId === c.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
            }`}
          >
            <img src={c.tutorPhoto || avatarFor(c.tutorName)} alt={c.tutorName} className="h-9 w-9 rounded-full bg-slate-100 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{c.tutorName}</p>
              <p className="truncate text-xs text-slate-500">{c.lastMessage?.text ?? 'No messages yet'}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex min-h-[420px] flex-col">
        {activeConversation && (
          <div className="flex items-center gap-2 border-b border-slate-100 p-3">
            <img
              src={activeConversation.tutorPhoto || avatarFor(activeConversation.tutorName)}
              alt={activeConversation.tutorName}
              className="h-8 w-8 rounded-full bg-slate-100 object-cover"
            />
            <p className="font-medium text-slate-900">{activeConversation.tutorName}</p>
          </div>
        )}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {thread.length === 0 && <p className="text-sm text-slate-400">Say hello to get the conversation started.</p>}
          {thread.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                  m.sender === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        {error && <div className="mx-3 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="flex gap-2 border-t border-slate-100 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
