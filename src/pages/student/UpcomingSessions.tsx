import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import type { Session, Tutor } from '../../types'

interface UpcomingSessionsProps {
  sessions: Session[]
  tutors: Record<string, Tutor>
  onRefresh: () => void
}

export default function UpcomingSessions({ sessions, tutors, onRefresh }: UpcomingSessionsProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const upcoming = sessions.filter((s) => s.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date))

  const handleCancel = async (sessionId: string) => {
    setError('')
    setCancellingId(sessionId)
    try {
      await api.patch(`/sessions/${sessionId}`, { status: 'cancelled' })
      onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel this session.')
    } finally {
      setCancellingId(null)
    }
  }

  if (upcoming.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-slate-500">No upcoming sessions yet.</p>
        <Link to="/tutors" className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Find a tutor to book your next session →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {upcoming.map((s) => {
        const tutor = tutors[s.tutorId]
        return (
          <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            {tutor && <img src={tutor.photo} alt={tutor.name} className="h-14 w-14 rounded-xl bg-slate-100 object-cover" />}
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{s.subject}</p>
              <p className="text-sm text-slate-500">with {tutor?.name ?? 'Unknown tutor'}</p>
            </div>
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">{s.date}</p>
              <p>
                {s.time} · {s.durationMins} min · {s.format === 'online' ? 'Online' : 'In-person'}
              </p>
            </div>
            <div className="flex gap-2">
              {tutor && (
                <Link
                  to={`/tutors/${tutor.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Tutor
                </Link>
              )}
              <button
                onClick={() => handleCancel(s.id)}
                disabled={cancellingId === s.id}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {cancellingId === s.id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
