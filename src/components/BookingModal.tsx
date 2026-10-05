import { useState } from 'react'
import type { Tutor } from '../types'
import { api, ApiError } from '../lib/api'
import Modal from './Modal'

interface BookingModalProps {
  tutor: Tutor
  open: boolean
  onClose: () => void
  onBooked?: () => void
}

export default function BookingModal({ tutor, open, onClose, onBooked }: BookingModalProps) {
  const [subject, setSubject] = useState(tutor.subjects[0])
  const [tierId, setTierId] = useState(tutor.pricingTiers[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [format, setFormat] = useState<'online' | 'in-person'>(tutor.format === 'in-person' ? 'in-person' : 'online')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const tier = tutor.pricingTiers.find((t) => t.id === tierId) ?? tutor.pricingTiers[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) return
    setError('')
    setSubmitting(true)
    try {
      await api.post('/sessions', {
        tutorId: tutor.id,
        subject,
        date,
        time,
        durationMins: tier?.durationMins ?? 60,
        format,
      })
      setConfirmed(true)
      onBooked?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setConfirmed(false)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={confirmed ? 'Booking confirmed!' : `Book a session with ${tutor.name}`}>
      {confirmed ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Your {tier?.durationMins}-minute {subject} session is booked for {date} at {time}. You can manage it from
            your Student Dashboard.
          </p>
          <button
            onClick={handleClose}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="text-sm font-medium text-slate-700">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {tutor.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Session type</label>
            <select
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {tutor.pricingTiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} — {t.durationMins} min — ${t.rate}
                </option>
              ))}
            </select>
          </div>

          {tutor.format === 'both' && (
            <div>
              <label className="text-sm font-medium text-slate-700">Format</label>
              <div className="mt-1.5 flex gap-2">
                {(['online', 'in-person'] as const).map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                      format === f ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-600 ring-slate-300'
                    }`}
                  >
                    {f === 'online' ? 'Online' : 'In-person'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Total: <span className="font-semibold text-slate-900">${tier?.rate}</span> for {tier?.durationMins} minutes
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Booking...' : 'Confirm booking'}
          </button>
        </form>
      )}
    </Modal>
  )
}
