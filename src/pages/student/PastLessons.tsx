import type { Session, Tutor } from '../../types'

interface PastLessonsProps {
  sessions: Session[]
  tutors: Record<string, Tutor>
}

export default function PastLessons({ sessions, tutors }: PastLessonsProps) {
  const past = sessions.filter((s) => s.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))

  if (past.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-slate-500">No past lessons yet — your lesson notes will show up here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {past.map((s) => {
        const tutor = tutors[s.tutorId]
        return (
          <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                {tutor && <img src={tutor.photo} alt={tutor.name} className="h-10 w-10 rounded-lg bg-slate-100 object-cover" />}
                <div>
                  <p className="font-semibold text-slate-900">{s.subject}</p>
                  <p className="text-xs text-slate-500">with {tutor?.name ?? 'Unknown tutor'}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {s.date} · {s.time}
              </p>
            </div>
            {s.notes ? (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{s.notes}</p>
            ) : (
              <p className="mt-3 text-sm italic text-slate-400">No notes left for this session.</p>
            )}
            {s.homework.length > 0 && (
              <div className="mt-3 space-y-1">
                {s.homework.map((h) => (
                  <div key={h.id} className="text-xs text-slate-500">
                    📎 {h.fileName} {h.feedback && <span className="text-slate-400">— {h.feedback}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
