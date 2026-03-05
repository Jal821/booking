export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface WorkingHours {
  start: string
  end: string
  active: boolean
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface Business {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  timezone: string
  slug: string
  logo_url?: string
  telegram_chat_id?: string
}

export interface Staff {
  id: string
  business_id: string
  name: string
  email?: string
  google_calendar_id?: string
  working_hours: Record<DayOfWeek, WorkingHours>
}

export interface Service {
  id: string
  business_id: string
  name: string
  description?: string
  duration_minutes: number
  cleanup_minutes: number
  price?: number
  currency: string
  color: string
  active: boolean
}

export interface Booking {
  id: string
  business_id: string
  staff_id: string
  service_id: string
  client_name: string
  client_email: string
  client_phone?: string
  starts_at: string
  ends_at: string
  status: 'confirmed' | 'cancelled' | 'no_show'
  notes?: string
  google_event_id?: string
}
