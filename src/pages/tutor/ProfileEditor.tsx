import { useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { PricingTier, TeachingFormat, Tutor } from '../../types'

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState('')

  const add = () => {
    if (draft.trim()) {
      onChange([...values, draft.trim()])
      setDraft('')
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-200">
            {v}
            <button onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-indigo-400 hover:text-indigo-600">
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button onClick={add} type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Add
        </button>
      </div>
    </div>
  )
}

interface ProfileEditorProps {
  tutor: Tutor
  onSaved: () => void
}

export default function ProfileEditor({ tutor, onSaved }: ProfileEditorProps) {
  const [form, setForm] = useState({
    tagline: tutor.tagline,
    bio: tutor.bio,
    hourlyRate: tutor.hourlyRate,
    format: tutor.format,
    education: tutor.education,
    certifications: tutor.certifications,
    subjects: tutor.subjects,
  })
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(tutor.pricingTiers)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateTier = (id: string, field: keyof PricingTier, value: string | number) => {
    setPricingTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
    setSaved(false)
  }

  const addTier = () => {
    setPricingTiers((prev) => [...prev, { id: `local-${Date.now()}`, label: 'New package', durationMins: 60, rate: form.hourlyRate }])
    setSaved(false)
  }

  const removeTier = (id: string) => {
    setPricingTiers((prev) => prev.filter((t) => t.id !== id))
    setSaved(false)
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const updated = await api.patch<Tutor>(`/tutors/${tutor.id}`, { ...form, pricingTiers })
      setPricingTiers(updated.pricingTiers)
      setSaved(true)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Edit your profile</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-600">Profile saved.</p>}

      <section className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Basics</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => (setForm({ ...form, tagline: e.target.value }), setSaved(false))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => (setForm({ ...form, bio: e.target.value }), setSaved(false))}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Base hourly rate ($)</label>
              <input
                type="number"
                value={form.hourlyRate}
                onChange={(e) => (setForm({ ...form, hourlyRate: Number(e.target.value) }), setSaved(false))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Teaching format</label>
              <select
                value={form.format}
                onChange={(e) => (setForm({ ...form, format: e.target.value as TeachingFormat }), setSaved(false))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="online">Online only</option>
                <option value="in-person">In-person only</option>
                <option value="both">Online & in-person</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Credentials</h3>
        <div className="mt-4 space-y-4">
          <TagInput
            label="Education"
            values={form.education}
            onChange={(v) => (setForm({ ...form, education: v }), setSaved(false))}
            placeholder="e.g. B.S. Mathematics, MIT"
          />
          <TagInput
            label="Certifications"
            values={form.certifications}
            onChange={(v) => (setForm({ ...form, certifications: v }), setSaved(false))}
            placeholder="e.g. State Teaching License"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Subjects offered</h3>
        <div className="mt-4">
          <TagInput
            label="Subjects"
            values={form.subjects}
            onChange={(v) => (setForm({ ...form, subjects: v }), setSaved(false))}
            placeholder="e.g. Algebra II"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Pricing tiers</h3>
          <button onClick={addTier} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            + Add tier
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {pricingTiers.map((tier) => (
            <div key={tier.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 p-3">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-slate-600">Label</label>
                <input
                  value={tier.label}
                  onChange={(e) => updateTier(tier.id, 'label', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Duration (min)</label>
                <input
                  type="number"
                  value={tier.durationMins}
                  onChange={(e) => updateTier(tier.id, 'durationMins', Number(e.target.value))}
                  className="mt-1 w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Rate ($)</label>
                <input
                  type="number"
                  value={tier.rate}
                  onChange={(e) => updateTier(tier.id, 'rate', Number(e.target.value))}
                  className="mt-1 w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <button onClick={() => removeTier(tier.id)} className="text-xs text-red-500 hover:text-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
