import { Link } from 'react-router-dom'

const studentSteps = [
  { title: '1. Search', desc: 'Filter by subject, grade level, price, availability, rating, and format.' },
  { title: '2. Compare', desc: "Review tutor profiles — bios, education, intro videos, and real reviews." },
  { title: '3. Book', desc: 'Pick a time slot and confirm instantly. No back-and-forth emails.' },
  { title: '4. Learn', desc: 'Message your tutor, track lesson notes, and upload homework from your dashboard.' },
]

const tutorSteps = [
  { title: '1. Create your profile', desc: 'Add your credentials, subjects, and an intro video to stand out.' },
  { title: '2. Set your availability', desc: 'Define your working hours, lesson durations, and vacation days.' },
  { title: '3. Set your pricing', desc: 'Offer single sessions or discounted packages at your own rates.' },
  { title: '4. Start teaching', desc: 'Accept bookings, message students, and manage everything from your dashboard.' },
]

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl font-bold text-slate-900">How BrainBooked works</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
        Whether you're looking to learn or looking to teach, BrainBooked makes it simple.
      </p>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-indigo-700">For Students</h2>
          <div className="mt-4 space-y-4">
            {studentSteps.map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{s.title}</p>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/tutors" className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Find a Tutor
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-indigo-700">For Tutors</h2>
          <div className="mt-4 space-y-4">
            {tutorSteps.map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{s.title}</p>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/tutor"
            className="mt-5 inline-block rounded-lg border border-indigo-600 px-5 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Go to Tutor Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
