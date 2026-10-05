import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Session, Tutor } from '../types'
import { avatarFor } from '../lib/avatar'
import AvailabilityCalendar from './tutor/AvailabilityCalendar'
import ProfileEditor from './tutor/ProfileEditor'

const tabs = [
  { id: 'availability', label: 'Availability Calendar' },
  { id: 'profile', label: 'Profile Editor' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function TutorDashboard() {
  const { user } = useAuth()
  const [active, setActive] = useState<TabId>('availability')
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [upcomingCount, setUpcomingCount] = useState(0)

  const loadTutor = useCallback(async () => {
    if (!user?.tutorId) return
    const t = await api.get<Tutor>(`/tutors/${user.tutorId}`)
    setTutor(t)
  }, [user?.tutorId])

  useEffect(() => {
    loadTutor()
    api
      .get<Session[]>('/sessions')
      .then((sessions) => setUpcomingCount(sessions.filter((s) => s.status === 'upcoming').length))
      .catch(() => setUpcomingCount(0))
  }, [loadTutor])

  if (!tutor) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-400">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <img src={tutor.photo || avatarFor(tutor.name)} alt={tutor.name} className="h-14 w-14 rounded-xl bg-slate-100 object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {tutor.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {upcomingCount} upcoming session{upcomingCount === 1 ? '' : 's'} · ${tutor.hourlyRate}/hr base rate
          </p>
        </div>
      </div>

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
        {active === 'availability' && <AvailabilityCalendar tutor={tutor} onSaved={loadTutor} />}
        {active === 'profile' && <ProfileEditor tutor={tutor} onSaved={loadTutor} />}
      </div>
    </div>
  )
}
