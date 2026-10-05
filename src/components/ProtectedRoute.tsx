import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

export default function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-400">Loading...</div>
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student'} replace />
  }

  return <>{children}</>
}
