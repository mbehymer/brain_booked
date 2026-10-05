# BrainBooked

Front-end for BrainBooked, a tutor marketplace connecting students with tutors for online and in-person lessons.

This front-end talks to a real backend over HTTP (cookie-based session auth) — it no longer uses mock data. The backend URL is configured via `VITE_API_URL` (see `.env.example`); it defaults to `http://localhost:4000`. See [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) for the API contract this was built against.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7

## Getting started

```bash
cp .env.example .env   # point VITE_API_URL at your backend if it's not on localhost:4000
npm install
npm run dev
```

The backend must be running and reachable at `VITE_API_URL` — the app makes live requests on load (tutor search, auth check, etc.) and has no offline/mock fallback.

## Project structure

```
src/
  components/      Shared UI (Navbar, TutorCard, FilterSidebar, BookingModal, ProtectedRoute, ...)
  context/         AuthContext — session state (/me, login, signup, logout)
  lib/             api.ts (fetch wrapper), avatar.ts (local SVG fallback avatars), constants.ts
  pages/           Route-level pages
    student/       Student Dashboard tabs
    tutor/         Tutor Dashboard tabs
  types.ts         Shared domain types, matching the backend's response shapes
```

## Features implemented

**Auth**
- Sign up / log in / log out (`/signup`, `/login`) against the real backend, httpOnly cookie session
- Protected dashboard routes — redirect to login if logged out, redirect to the correct dashboard if the wrong role

**Students**
- Advanced search & filters on `/tutors` — subject, grade level, hourly rate, rating, format, availability day (server-side filtering)
- Tutor profile pages (`/tutors/:id`) — bio, education, intro video, reviews, booking CTA, "Message" to start a conversation
- Student dashboard (`/dashboard/student`) — upcoming sessions (with cancel), past lesson notes, tutor messaging, homework upload (real file upload)

**Tutors**
- Availability calendar (`/dashboard/tutor`) — weekly working hours and vacation/time-off management, saved via the API
- Profile editor — credentials, subject offerings, and pricing tiers, saved via the API

## Not yet built

Reviews can only be read, not submitted (no UI for it yet, though the backend supports it). No payments. No real-time messaging (the Messages tab polls only on send/switch, not live). See [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) for the fuller list of open questions.
