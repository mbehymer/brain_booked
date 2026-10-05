export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
                B
              </span>
              <span className="text-base font-bold text-slate-900">BrainBooked</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Connecting students with vetted, passionate tutors for online and in-person lessons.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Students</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Find a Tutor</li>
              <li>How it Works</li>
              <li>Pricing</li>
              <li>Reviews</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Tutors</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Become a Tutor</li>
              <li>Tutor Resources</li>
              <li>Community</li>
              <li>Support</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-sm text-slate-400">
          © 2026 BrainBooked. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
