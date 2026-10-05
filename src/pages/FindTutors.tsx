import { useEffect, useState } from 'react'
import { api, toQueryString } from '../lib/api'
import type { Tutor, TutorListResponse } from '../types'
import FilterSidebar, { defaultFilters, type Filters } from '../components/FilterSidebar'
import TutorCard from '../components/TutorCard'

type SortBy = 'rating' | 'price-asc' | 'price-desc' | 'experience'

export default function FindTutors() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sortBy, setSortBy] = useState<SortBy>('rating')
  const [subjects, setSubjects] = useState<string[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<string[]>('/subjects')
      .then(setSubjects)
      .catch(() => setSubjects([]))
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true)
      setError('')
      const query = toQueryString({
        search: filters.search,
        subjects: filters.subjects,
        gradeLevels: filters.gradeLevels,
        format: filters.format !== 'any' ? filters.format : undefined,
        minRating: filters.minRating || undefined,
        maxRate: filters.maxRate,
        day: filters.day !== 'any' ? filters.day : undefined,
        sort: sortBy,
        pageSize: 50,
      })
      api
        .get<TutorListResponse>(`/tutors${query}`)
        .then((res) => {
          setTutors(res.tutors)
          setTotal(res.total)
        })
        .catch(() => setError('Could not load tutors. Please try again.'))
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(handle)
  }, [filters, sortBy])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Find your tutor</h1>
        <p className="mt-1 text-sm text-slate-500">{total} tutors match your search</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar filters={filters} onChange={setFilters} subjects={subjects} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end gap-2">
            <label className="text-sm text-slate-500">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="rating">Highest rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="experience">Most experienced</option>
            </select>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
              Loading tutors...
            </div>
          ) : tutors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-slate-500">No tutors match those filters. Try widening your search.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tutors.map((t) => (
                <TutorCard key={t.id} tutor={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
