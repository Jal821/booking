import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(name), staff(name)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const start = new Date(booking.starts_at)
  const end = new Date(booking.ends_at)

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Booking System//EN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@booking`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${booking.services?.name ?? 'Appointment'}`,
    `DESCRIPTION:Staff: ${booking.staff?.name ?? 'N/A'}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="booking.ics"`,
    },
  })
}