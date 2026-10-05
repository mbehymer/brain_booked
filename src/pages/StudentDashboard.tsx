import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Session, Tutor } from '../types'
import UpcomingSessions from './student/UpcomingSessions'
import PastLessons from './student/PastLessons'
import Messages from './student/Messages'
import Homework from './student/Homework'

const tabs = [
  { id: 'upcoming', label: 'Upcoming Sessions' },
  { id: 'past', label: 'Past Lessons & Notes' },
  { id: 'messages', label: 'Messages' },
  { id: 'homework', label: 'Homework' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function StudentDashboard() {
  const [searchParams] = useSearchParams()
  const initialTab = tabs.some((t) => t.id === searchParams.get('tab')) ? (searchParams.get('tab') as TabId) : 'upcoming'
  const [active, setActive] = useState<TabId>(initialTab)
  const [sessions, setSessions] = useState<Session[]>([])
  const [tutors, setTutors] = useState<Record<string, Tutor>>({})
  const [loading, setLoading] = useState(true)
  const fetchedTutorIds = useRef(new Set<string>())

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.get<Session[]>('/sessions')
      setSessions(data)
      const uniqueTutorIds = Array.from(new Set(data.map((s) => s.tutorId)))
      const missing = uniqueTutorIds.filter((id) => !fetchedTutorIds.current.has(id))
      missing.forEach((id) => fetchedTutorIds.current.add(id))
      if (missing.length > 0) {
        const fetched = await Promise.all(
          missing.map((id) =>
            api
              .get<Tutor>(`/tutors/${id}`)
              .then((t) => [id, t] as const)
              .catch(() => null),
          ),
        )
        setTutors((prev) => {
          const next = { ...prev }
          for (const entry of fetched) {
            if (entry) next[entry[0]] = entry[1]
          }
          return next
        })
      }
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Track your sessions, notes, messages, and homework in one place.</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            Loading...
          </div>
        ) : (
          <>
            {active === 'upcoming' && <UpcomingSessions sessions={sessions} tutors={tutors} onRefresh={loadSessions} />}
            {active === 'past' && <PastLessons sessions={sessions} tutors={tutors} />}
            {active === 'messages' && <Messages />}
            {active === 'homework' && <Homework sessions={sessions} tutors={tutors} onRefresh={loadSessions} />}
          </>
        )}
      </div>
    </div>
  )
}
