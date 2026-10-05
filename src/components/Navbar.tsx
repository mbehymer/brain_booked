import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const dashboardPath = user?.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student'

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">B</span>
          <span className="text-lg font-bold text-slate-900">BrainBooked</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/tutors" className={linkClass}>
            Find Tutors
          </NavLink>
          {user && (
            <NavLink to={dashboardPath} className={linkClass}>
              {user.role === 'student' ? 'Student Dashboard' : 'Tutor Dashboard'}
            </NavLink>
          )}
          <NavLink to="/how-it-works" className={linkClass}>
            How it Works
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-500">
                Hi, <span className="font-medium text-slate-700">{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/tutors" className={linkClass} onClick={() => setOpen(false)}>
              Find Tutors
            </NavLink>
            {user && (
              <NavLink to={dashboardPath} className={linkClass} onClick={() => setOpen(false)}>
                {user.role === 'student' ? 'Student Dashboard' : 'Tutor Dashboard'}
              </NavLink>
            )}
            <NavLink to="/how-it-works" className={linkClass} onClick={() => setOpen(false)}>
              How it Works
            </NavLink>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Log out ({user.name.split(' ')[0]})
              </button>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className={linkClass} onClick={() => setOpen(false)}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
