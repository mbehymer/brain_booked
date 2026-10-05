import { useRef, useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { Session, Tutor } from '../../types'

interface HomeworkProps {
  sessions: Session[]
  tutors: Record<string, Tutor>
  onRefresh: () => void
}

export default function Homework({ sessions, tutors, onRefresh }: HomeworkProps) {
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const relevantSessions = sessions.filter((s) => s.status !== 'cancelled').sort((a, b) => b.date.localeCompare(a.date))

  const handleFileChange = async (sessionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploadingId(sessionId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/sessions/${sessionId}/homework`, formData)
      onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not upload that file.')
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {relevantSessions.map((s) => {
        const tutor = tutors[s.tutorId]
        return (
          <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {s.subject} <span className="text-slate-400">· {s.date}</span>
                </p>
                <p className="text-xs text-slate-500">with {tutor?.name ?? 'Unknown tutor'}</p>
              </div>
              <div>
                <input
                  type="file"
                  className="hidden"
                  ref={(el) => {
                    fileInputs.current[s.id] = el
                  }}
                  onChange={(e) => handleFileChange(s.id, e)}
                />
                <button
                  onClick={() => fileInputs.current[s.id]?.click()}
                  disabled={uploadingId === s.id}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploadingId === s.id ? 'Uploading...' : 'Upload homework'}
                </button>
              </div>
            </div>
            {s.homework.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {s.homework.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-700">📎 {h.fileName}</span>
                    <span className="text-xs text-slate-400">{h.uploadedAt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm italic text-slate-400">No files uploaded for this session.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
