import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, toQueryString } from '../lib/api'
import type { Tutor, TutorListResponse } from '../types'
import TutorCard from '../components/TutorCard'
import { avatarFor } from '../lib/avatar'

const steps = [
  {
    title: 'Search & compare',
    desc: 'Filter tutors by subject, grade level, price, rating, and format to find your perfect match.',
  },
  {
    title: 'Book instantly',
    desc: 'Pick a time that works for your schedule and confirm your session in a couple of clicks.',
  },
  {
    title: 'Learn & track progress',
    desc: 'Message your tutor, review lesson notes, and keep homework organized from your dashboard.',
  },
]

export default function Home() {
  const [tutors, setTutors] = useState<Tutor[]>([])

  useEffect(() => {
    api
      .get<TutorListResponse>(`/tutors${toQueryString({ sort: 'rating', pageSize: 4 })}`)
      .then((res) => setTutors(res.tutors))
      .catch(() => setTutors([]))
  }, [])

  const featured = tutors.slice(0, 3)

  return (
    <div>
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                Over 2,000 vetted tutors
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Find a tutor your kid will actually <span className="text-indigo-600">look forward to</span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-slate-600">
                BrainBooked connects students with top-rated tutors for one-on-one lessons, online or in-person —
                in math, science, languages, test prep, and more.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/tutors"
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Find a Tutor
                </Link>
                <Link
                  to="/how-it-works"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  How it Works
                </Link>
              </div>
              <div className="mt-8 flex gap-8 text-sm text-slate-500">
                <div>
                  <p className="text-2xl font-bold text-slate-900">4.9/5</p>
                  <p>average rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">50k+</p>
                  <p>sessions booked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">30+</p>
                  <p>subjects covered</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {tutors.slice(0, 4).map((t) => (
                  <Link key={t.id} to={`/tutors/${t.id}`} className="rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
                    <img src={t.photo || avatarFor(t.name)} alt={t.name} className="h-16 w-16 rounded-xl bg-slate-100 object-cover" />
                    <p className="mt-2 text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.subjects[0]}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900">How BrainBooked works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured tutors</h2>
            <Link to="/tutors" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View all tutors →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-indigo-600 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">Are you a tutor?</h2>
          <p className="mx-auto mt-2 max-w-md text-indigo-100">
            Set your own hours, your own rates, and connect with students who are excited to learn from you.
          </p>
          <Link
            to="/signup"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Start Tutoring
          </Link>
        </div>
      </section>
    </div>
  )
}
