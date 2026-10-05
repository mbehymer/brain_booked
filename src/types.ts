export type TeachingFormat = 'online' | 'in-person' | 'both'

export interface Review {
  id: string
  studentName: string
  rating: number
  comment: string
  date: string
}

export interface AvailabilitySlot {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  start: string
  end: string
}

export interface TimeOff {
  id: string
  label: string
  start: string
  end: string
}

export interface PricingTier {
  id: string
  label: string
  durationMins: number
  rate: number
}

export interface Tutor {
  id: string
  name: string
  photo: string
  tagline: string
  bio: string
  education: string[]
  certifications: string[]
  subjects: string[]
  gradeLevels: ('Elementary' | 'Middle School' | 'High School' | 'College' | 'Adult')[]
  hourlyRate: number
  rating: number
  reviewCount: number
  format: TeachingFormat
  location?: string
  introVideoUrl?: string
  yearsExperience: number
  responseTime: string
  languages: string[]
  timezone?: string
  reviews: Review[]
  availability: AvailabilitySlot[]
  timeOff: TimeOff[]
  pricingTiers: PricingTier[]
}

export type SessionStatus = 'upcoming' | 'completed' | 'cancelled'

export interface Session {
  id: string
  tutorId: string
  studentName: string
  subject: string
  date: string
  time: string
  durationMins: number
  status: SessionStatus
  format: 'online' | 'in-person'
  notes?: string
  homework: HomeworkItem[]
}

export interface HomeworkItem {
  id: string
  fileName: string
  uploadedAt: string
  feedback?: string
}

export interface Message {
  id: string
  tutorId: string
  sender: 'student' | 'tutor'
  text: string
  timestamp: string
}

export type UserRole = 'student' | 'tutor'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tutorId: string | null
}

export interface Conversation {
  id: string
  tutorId: string
  tutorName: string
  tutorPhoto: string
  studentId: string
  studentName: string
  lastMessage: Message | null
}

export interface TutorListResponse {
  tutors: Tutor[]
  total: number
  page: number
  pageSize: number
}
