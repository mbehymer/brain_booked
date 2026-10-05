import { useState } from 'react'
import { api, ApiError } from '../../lib/api'
import { weekdays } from '../../lib/constants'
import type { AvailabilitySlot, Tutor, TimeOff } from '../../types'

interface AvailabilityCalendarProps {
  tutor: Tutor
  onSaved: () => void
}

export default function AvailabilityCalendar({ tutor, onSaved }: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(tutor.availability)
  const [timeOff, setTimeOffState] = useState<TimeOff[]>(tutor.timeOff)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newOffLabel, setNewOffLabel] = useState('')
  const [newOffStart, setNewOffStart] = useState('')
  const [newOffEnd, setNewOffEnd] = useState('')

  const addSlot = (day: AvailabilitySlot['day']) => {
    setSlots((prev) => [...prev, { day, start: '09:00', end: '12:00' }])
    setSaved(false)
  }

  const updateSlot = (index: number, field: 'start' | 'end', value: string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
    setSaved(false)
  }

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  const addTimeOff = () => {
    if (!newOffLabel || !newOffStart || !newOffEnd) return
    setTimeOffState((prev) => [...prev, { id: `local-${Date.now()}`, label: newOffLabel, start: newOffStart, end: newOffEnd }])
    setNewOffLabel('')
    setNewOffStart('')
    setNewOffEnd('')
    setSaved(false)
  }

  const removeTimeOff = (id: string) => {
    setTimeOffState((prev) => prev.filter((t) => t.id !== id))
    setSaved(false)
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      await api.put(`/tutors/${tutor.id}/availability`, slots)
      await api.put(`/tutors/${tutor.id}/time-off`, timeOff)
      setSaved(true)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your availability.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Regular working hours</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {saved && !error && <p className="mt-2 text-sm text-emerald-600">Availability saved.</p>}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {weekdays.map((day) => {
            const daySlots = slots.map((s, i) => ({ ...s, index: i })).filter((s) => s.day === day)
            return (
              <div key={day} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{day}</p>
                  <button onClick={() => addSlot(day)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    + Add slot
                  </button>
                </div>
                {daySlots.length === 0 ? (
                  <p className="mt-2 text-xs italic text-slate-400">Not available</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {daySlots.map((s) => (
                      <div key={s.index} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={s.start}
                          onChange={(e) => updateSlot(s.index, 'start', e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        />
                        <span className="text-slate-400">–</span>
                        <input
                          type="time"
                          value={s.end}
                          onChange={(e) => updateSlot(s.index, 'end', e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button onClick={() => removeSlot(s.index)} className="ml-auto text-xs text-red-500 hover:text-red-600">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900">Vacation & time off</h2>
        <div className="mt-3 space-y-2">
          {timeOff.length === 0 && <p className="text-sm italic text-slate-400">No upcoming time off scheduled.</p>}
          {timeOff.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{t.label}</p>
                <p className="text-slate-500">
                  {t.start} → {t.end}
                </p>
              </div>
              <button onClick={() => removeTimeOff(t.id)} className="text-xs text-red-500 hover:text-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-slate-300 p-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Label</label>
            <input
              value={newOffLabel}
              onChange={(e) => setNewOffLabel(e.target.value)}
              placeholder="e.g. Winter break"
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Start</label>
            <input
              type="date"
              value={newOffStart}
              onChange={(e) => setNewOffStart(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">End</label>
            <input
              type="date"
              value={newOffEnd}
              onChange={(e) => setNewOffEnd(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={addTimeOff}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Add time off
          </button>
        </div>
      </section>
    </div>
  )
}
