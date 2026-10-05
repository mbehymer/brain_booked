# BrainBooked — Backend Requirements

This front-end currently runs entirely on mock data held in React state (`src/context/AppContext.tsx`, seeded from `src/data/`). Nothing persists, there's no auth, and no network calls are made. This document specifies what the backend needs to provide to replace that mock layer, derived directly from the data shapes and actions the front-end already expects (see `src/types.ts`).

It's organized by domain. Each section lists the data shape the front-end expects, the operations it needs, and behavior/validation that has to live server-side (the front-end does none of it today).

---

## 1. Core data models

These TypeScript interfaces (from `src/types.ts`) are the contract the front-end already codes against. API responses should match these shapes (or the backend team can propose a mapping layer, but the front-end will need to adjust if the shape changes).

```ts
interface Tutor {
  id: string
  name: string
  photo: string              // URL
  tagline: string
  bio: string
  education: string[]
  certifications: string[]
  subjects: string[]
  gradeLevels: ('Elementary' | 'Middle School' | 'High School' | 'College' | 'Adult')[]
  hourlyRate: number
  rating: number              // derived/aggregated from reviews
  reviewCount: number         // derived
  format: 'online' | 'in-person' | 'both'
  location?: string
  introVideoUrl?: string      // URL, currently assumed embeddable (e.g. YouTube embed URL)
  yearsExperience: number
  responseTime: string        // currently free text; consider deriving from real message latency later
  languages: string[]
  reviews: Review[]
  availability: AvailabilitySlot[]   // recurring weekly hours
  timeOff: TimeOff[]                 // date-range exceptions
  pricingTiers: PricingTier[]
}

interface Review {
  id: string
  studentName: string
  rating: number               // 1-5
  comment: string
  date: string                 // ISO date
}

interface AvailabilitySlot {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  start: string                 // "HH:MM", 24h
  end: string
}

interface TimeOff {
  id: string
  label: string
  start: string                 // ISO date
  end: string                   // ISO date
}

interface PricingTier {
  id: string
  label: string
  durationMins: number
  rate: number
}

interface Session {              // a booked lesson
  id: string
  tutorId: string
  studentName: string            // should become studentId once auth exists
  subject: string
  date: string                   // ISO date
  time: string                   // "HH:MM"
  durationMins: number
  status: 'upcoming' | 'completed' | 'cancelled'
  format: 'online' | 'in-person'
  notes?: string                 // tutor's lesson notes, added after the session
  homework: HomeworkItem[]
}

interface HomeworkItem {
  id: string
  fileName: string
  uploadedAt: string              // ISO date
  feedback?: string               // tutor's feedback on the file
}

interface Message {
  id: string
  tutorId: string                 // paired with the student via the session, see §5
  sender: 'student' | 'tutor'
  text: string
  timestamp: string                // ISO datetime
}
```

Two users: `student` and `tutor` roles. A `Tutor` record is the public-facing profile for a user with the tutor role.

---

## 2. Auth & accounts

Not implemented at all on the front-end yet — there's just a cosmetic "I'm a Student / I'm a Tutor" toggle in the navbar standing in for login. The backend needs:

- Sign up / log in for both roles (email+password at minimum; OAuth is a nice-to-have, not required).
- Session handling (JWT or cookie session — front-end has no preference, pick what's simplest to integrate with a Vite SPA).
- `GET /me` → returns the logged-in user's role and, if a tutor, their `Tutor` record id.
- Authorization rules:
  - A tutor can only edit their **own** profile, availability, and time-off.
  - A student can only see their **own** sessions, messages, and homework.
  - Anyone (including logged-out visitors) can browse `/tutors` and tutor profile pages.

---

## 3. Tutor search & profiles

- `GET /tutors` — list with filtering, used by the Find Tutors page (`src/pages/FindTutors.tsx`). Needs to support, as query params:
  - `search` (matches name, tagline, or subject)
  - `subjects` (multi-value)
  - `gradeLevels` (multi-value)
  - `format` (`online` | `in-person` | `any`)
  - `minRating`
  - `maxRate`
  - `day` (filter to tutors with an availability slot on that weekday)
  - `sort` (`rating` | `price-asc` | `price-desc` | `experience`)
  - Pagination (`page`/`pageSize` or cursor) — the front-end currently renders the full list client-side; this should change once the dataset is real and not ~8 records.
- `GET /tutors/:id` — full profile, as shaped above.
- `GET /subjects` — distinct list of subjects across all tutors, used to populate the subject filter checklist (`allSubjects` is currently derived client-side from the mock array — with a real dataset this should come from the server, likely cached).
- `PATCH /tutors/:id` — profile editor (`src/pages/tutor/ProfileEditor.tsx`) updates: `tagline`, `bio`, `hourlyRate`, `format`, `education`, `certifications`, `subjects`, `pricingTiers`. Tutor-auth only, own record only.
- Photo & intro video upload — see §6.

---

## 4. Availability & scheduling

Covers `src/pages/tutor/AvailabilityCalendar.tsx`.

- `PUT /tutors/:id/availability` — replace the tutor's full weekly `AvailabilitySlot[]`. (The UI edits the whole list client-side, then saves in one shot — a full replace is simplest to match that flow, though a more granular create/update/delete-per-slot API is also fine.)
- `PUT /tutors/:id/time-off` — same, for `TimeOff[]`.
- **Validation the backend must own** (none of this happens client-side today):
  - Overlapping slots on the same day should be rejected or merged.
  - A new/edited availability window that would orphan existing **upcoming** bookings outside the new hours needs a decision: block the edit, or allow it and flag the affected sessions for the tutor to resolve manually. Front-end has no opinion here — needs a product decision.
  - Time-off ranges that overlap an existing upcoming booking — same issue.
- **Timezones**: `AvailabilitySlot` and `Session` times are currently naive "HH:MM" strings with no timezone attached. Before this goes real, decide whose timezone these are in (tutor's profile timezone, presumably) and how student-side display converts to the student's local time. This is a gap in the current front-end that needs to be designed, not just implemented.

---

## 5. Bookings (sessions)

Covers the booking modal (`src/components/BookingModal.tsx`) and both dashboards' session views.

- `POST /sessions` — create a booking. Payload: `tutorId`, `subject`, `date`, `time`, `durationMins` (from the chosen pricing tier), `format`. The student id comes from the auth session.
  - **Server-side validation required** (currently nothing checks this client-side): the requested slot must fall within the tutor's recurring availability, must not fall inside a `TimeOff` range, and must not collide with another confirmed session for that tutor. Reject with a clear error the UI can surface.
- `GET /sessions?role=student|tutor&status=upcoming|completed|cancelled` — list sessions for the current user, used by both dashboards.
- `PATCH /sessions/:id` — status changes: student/tutor cancellation, marking a session completed (likely automatic once the scheduled time passes, or tutor-triggered).
- `PATCH /sessions/:id/notes` — tutor adds/edits lesson notes after a session (shown in the student's "Past Lessons & Notes" tab). Tutor-auth only, and only for their own sessions.
- Reschedule: not in the current UI (cancel is implied as the only mutation available), but worth deciding whether reschedule is a distinct endpoint or "cancel + rebook."
- **Payments are out of scope of the current front-end** — the booking modal confirms a session with no payment step. If sessions should require payment up front, that's a UI addition the front-end hasn't built yet; flag it back if that's required before this ships.

---

## 6. File uploads

Three distinct upload needs, none implemented (the front-end currently just records a file *name*, not real file bytes):

- **Tutor profile photo** — image upload, returns a URL to store as `Tutor.photo`.
- **Tutor intro video** — either a direct video upload + hosting/transcoding, or (simpler) just store a URL to an externally-hosted video (YouTube/Vimeo) and embed it. The current mock data assumes the latter (`introVideoUrl` is a YouTube embed URL). Recommend starting there unless native video hosting is a hard requirement.
- **Homework files** — `POST /sessions/:id/homework`, multipart upload from the student (`src/pages/student/Homework.tsx`), returns a `HomeworkItem` with a real file URL. Needs:
  - File size/type limits (none currently enforced anywhere).
  - Storage (S3-compatible or similar) with access control — only the tutor and the student on that session should be able to download the file.
  - `PATCH /sessions/:id/homework/:homeworkId` — tutor adds feedback text.

---

## 7. Messaging

Covers `src/pages/student/Messages.tsx`. Currently modeled as flat messages keyed by `tutorId`, implicitly scoped to "the current student" — this needs a real conversation/thread concept once there's more than one student per tutor.

- A `Conversation` is effectively `(studentId, tutorId)`. Needs:
  - `GET /conversations` — list the current user's conversations (for a student: one per tutor they've messaged/booked; for a tutor: one per student).
  - `GET /conversations/:id/messages`
  - `POST /conversations/:id/messages`
- **Real-time**: the current UI updates optimistically and would feel broken without live delivery once it's a real two-sided chat (tutor needs to see student messages arrive without refreshing, and vice versa). Recommend WebSockets or SSE; polling is a fallback if that's out of scope for v1.
- Consider whether unread counts / read receipts are wanted — not in the current UI but a natural next step.

---

## 8. Reviews

Reviews are currently static mock data attached to each tutor, with no UI to submit one.

- `GET /tutors/:id/reviews` (or just embedded in `GET /tutors/:id` as it is now — either works for the front-end).
- `POST /tutors/:id/reviews` — not yet built in the UI, but implied by the feature set ("student reviews"). Needs: should only be allowed for a student who's had a `completed` session with that tutor; one review per student per tutor (or per session — decide which).
- `Tutor.rating` and `Tutor.reviewCount` should be server-computed aggregates, not client-editable.

---

## 9. Open questions for backend/product

These came up while mapping the mock data to a real API and need a decision before backend work starts:

1. **Timezones** — not handled anywhere currently (see §4).
2. **Payments** — not in the current UI at all; confirm whether booking should require payment before this ships.
3. **Video hosting** — external embed link (simple) vs. native upload/hosting (more infra).
4. **Messaging transport** — real-time (WebSocket/SSE) vs. polling.
5. **Reschedule flow** — distinct action, or cancel-and-rebook?
6. **Availability-edit conflicts** — what happens to existing bookings when a tutor shrinks their availability or adds time off over an already-booked slot?
