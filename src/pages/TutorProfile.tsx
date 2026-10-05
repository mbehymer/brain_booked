import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Tutor } from '../types'
import StarRating from '../components/StarRating'
import Badge from '../components/Badge'
import BookingModal from '../components/BookingModal'
import { avatarFor } from '../lib/avatar'

export default function TutorProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [messaging, setMessaging] = useState(false)
  const [messageError, setMessageError] = useState('')

  const handleBookClick = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/tutors/${id}`)}`)
      return
    }
    setBookingOpen(true)
  }

  const handleMessageClick = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/tutors/${id}`)}`)
      return
    }
    if (!id) return
    setMessageError('')
    setMessaging(true)
    try {
      await api.post('/conversations', { tutorId: id })
      navigate('/dashboard/student?tab=messages')
    } catch (err) {
      setMessageError(err instanceof ApiError ? err.message : 'Could not start a conversation.')
    } finally {
      setMessaging(false)
    }
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get<Tutor>(`/tutors/${id}`)
      .then(setTutor)
      .catch(() => setTutor(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Loading tutor...</div>
  }

  if (!tutor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Tutor not found</h1>
        <Link to="/tutors" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
          ← Back to search
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/tutors" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to search
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-start">
        <img
          src={tutor.photo || avatarFor(tutor.name)}
          alt={tutor.name}
          className="h-28 w-28 shrink-0 rounded-2xl bg-slate-100 object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tutor.name}</h1>
              <p className="mt-1 text-slate-600">{tutor.tagline}</p>
              <div className="mt-2">
                <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} size="md" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">${tutor.hourlyRate}</p>
              <p className="text-xs text-slate-400">per hour</p>
              {user?.role === 'tutor' ? (
                <p className="mt-3 text-xs text-slate-400">Tutor accounts can't book sessions.</p>
              ) : (
                <div className="mt-3 flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleMessageClick}
                      disabled={messaging}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {messaging ? 'Starting...' : 'Message'}
                    </button>
                    <button
                      onClick={handleBookClick}
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                    >
                      Book a Session
                    </button>
                  </div>
                  {messageError && <p className="text-xs text-red-600">{messageError}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tutor.subjects.map((s) => (
              <Badge key={s} tone="indigo">
                {s}
              </Badge>
            ))}
            <Badge tone={tutor.format === 'online' ? 'emerald' : tutor.format === 'in-person' ? 'amber' : 'slate'}>
              {tutor.format === 'both' ? 'Online & In-person' : tutor.format === 'online' ? 'Online' : 'In-person'}
            </Badge>
            {tutor.location && <Badge tone="slate">📍 {tutor.location}</Badge>}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {tutor.introVideoUrl && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Introduction</h2>
              <div className="mt-3 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <iframe
                  src={tutor.introVideoUrl}
                  title={`${tutor.name} introduction video`}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-slate-900">About {tutor.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{tutor.bio}</p>
          </section>

          {(tutor.education.length > 0 || tutor.certifications.length > 0) && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Education & Credentials</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {tutor.education.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span className="text-indigo-500">🎓</span>
                    {e}
                  </li>
                ))}
                {tutor.certifications.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-indigo-500">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Reviews ({tutor.reviewCount})</h2>
            {tutor.reviews.length === 0 ? (
              <p className="mt-3 text-sm italic text-slate-400">No reviews yet.</p>
            ) : (
              <div className="mt-3 space-y-4">
                {tutor.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{r.studentName}</p>
                      <StarRating rating={r.rating} showValue={false} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                    <p className="mt-2 text-xs text-slate-400">{r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Quick facts</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Experience</dt>
                <dd className="font-medium text-slate-900">{tutor.yearsExperience} years</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Response time</dt>
                <dd className="font-medium text-slate-900">{tutor.responseTime}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Languages</dt>
                <dd className="font-medium text-slate-900">{tutor.languages.join(', ')}</dd>
              </div>
              {tutor.gradeLevels.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Grade levels</dt>
                  <dd className="text-right font-medium text-slate-900">{tutor.gradeLevels.join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Weekly availability</h3>
            {tutor.availability.length === 0 ? (
              <p className="mt-3 text-sm italic text-slate-400">No availability listed yet.</p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {tutor.availability.map((a, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{a.day}</span>
                    <span>
                      {a.start}–{a.end}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Pricing</h3>
            {tutor.pricingTiers.length === 0 ? (
              <p className="mt-3 text-sm italic text-slate-400">No pricing tiers listed yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {tutor.pricingTiers.map((p) => (
                  <li key={p.id} className="flex justify-between text-slate-600">
                    <span>
                      {p.label} ({p.durationMins}m)
                    </span>
                    <span className="font-medium text-slate-900">${p.rate}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <BookingModal tutor={tutor} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
