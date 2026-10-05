import { Link } from 'react-router-dom'
import type { Tutor } from '../types'
import StarRating from './StarRating'
import Badge from './Badge'
import { avatarFor } from '../lib/avatar'

export default function TutorCard({ tutor }: { tutor: Tutor }) {
  return (
    <Link
      to={`/tutors/${tutor.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row"
    >
      <img src={tutor.photo || avatarFor(tutor.name)} alt={tutor.name} className="h-20 w-20 shrink-0 rounded-xl bg-slate-100 object-cover" />
      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{tutor.name}</h3>
            <p className="text-sm text-slate-500">{tutor.tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">${tutor.hourlyRate}</p>
            <p className="text-xs text-slate-400">per hour</p>
          </div>
        </div>
        <div className="mt-2">
          <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 3).map((s) => (
            <Badge key={s} tone="indigo">
              {s}
            </Badge>
          ))}
          <Badge tone={tutor.format === 'online' ? 'emerald' : tutor.format === 'in-person' ? 'amber' : 'slate'}>
            {tutor.format === 'both' ? 'Online & In-person' : tutor.format === 'online' ? 'Online' : 'In-person'}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
