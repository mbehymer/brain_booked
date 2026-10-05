import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'indigo' | 'emerald' | 'amber' | 'slate'
}

const toneClasses: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export default function Badge({ children, tone = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
