import { allGradeLevels } from '../lib/constants'

export interface Filters {
  search: string
  subjects: string[]
  gradeLevels: string[]
  format: 'any' | 'online' | 'in-person'
  minRating: number
  maxRate: number
  day: string
}

export const defaultFilters: Filters = {
  search: '',
  subjects: [],
  gradeLevels: [],
  format: 'any',
  minRating: 0,
  maxRate: 100,
  day: 'any',
}

const days = ['any', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface FilterSidebarProps {
  filters: Filters
  onChange: (filters: Filters) => void
  subjects: string[]
}

export default function FilterSidebar({ filters, onChange, subjects }: FilterSidebarProps) {
  const toggleArrayValue = (key: 'subjects' | 'gradeLevels', value: string) => {
    const current = filters[key]
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 lg:w-72">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Filters</h3>
        <button onClick={() => onChange(defaultFilters)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
          Reset all
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Search by name or keyword</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="e.g. Calculus, Maria..."
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Subject</h4>
        <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {subjects.map((subject) => (
            <label key={subject} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.subjects.includes(subject)}
                onChange={() => toggleArrayValue('subjects', subject)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {subject}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Grade level</h4>
        <div className="mt-2 space-y-1.5">
          {allGradeLevels.map((level) => (
            <label key={level} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.gradeLevels.includes(level)}
                onChange={() => toggleArrayValue('gradeLevels', level)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Format</h4>
        <div className="mt-2 flex gap-2">
          {(['any', 'online', 'in-person'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onChange({ ...filters, format: f })}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
                filters.format === f
                  ? 'bg-indigo-600 text-white ring-indigo-600'
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {f === 'any' ? 'Any' : f === 'online' ? 'Online' : 'In-person'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Max hourly rate: ${filters.maxRate}</h4>
        <input
          type="range"
          min={20}
          max={100}
          step={5}
          value={filters.maxRate}
          onChange={(e) => onChange({ ...filters, maxRate: Number(e.target.value) })}
          className="mt-2 w-full accent-indigo-600"
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Minimum rating</h4>
        <div className="mt-2 flex gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: r })}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
                filters.minRating === r
                  ? 'bg-indigo-600 text-white ring-indigo-600'
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Available on</h4>
        <select
          value={filters.day}
          onChange={(e) => onChange({ ...filters, day: e.target.value })}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d === 'any' ? 'Any day' : d}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}
