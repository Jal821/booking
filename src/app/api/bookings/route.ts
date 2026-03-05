import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createCalendarEvent } from '@/lib/google-calendar'
import { sendOwnerNotification } from '@/lib/email'
import { addMinutes } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business_id, staff_id, service_id, starts_at, client_name, client_email, client_phone, notes } = body

    const { data: service } = await supabase.from('services').select('*').eq('id', service_id).single()
    const { data: staff } = await supabase.from('staff').select('*').eq('id', staff_id).single()

    const startsAt = new Date(starts_at)
    const endsAt = addMinutes(startsAt, (service?.duration_minutes ?? 60) + (service?.cleanup_minutes ?? 0))

    let calendarEventId = null
    try {
      const event = await createCalendarEvent(
        staff?.google_calendar_id,
        `${service?.name} - ${client_name}`,
        `Client: ${client_name}\nEmail: ${client_email}\nPhone: ${client_phone ?? 'N/A'}\nNotes: ${notes ?? 'N/A'}`,
        startsAt.toISOString(),
        endsAt.toISOString(),
        client_email,
        'Europe/Bratislava'
      )
      calendarEventId = event?.id ?? null
    } catch (e) {
      console.error('Google Calendar error (non-fatal):', e)
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        business_id,
        staff_id,
        service_id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        client_name,
        client_email,
        client_phone,
        notes,
        status: 'confirmed',
        calendar_event_id: calendarEventId,
        reminder_sent: false,
        review_sent: false,
      })
      .select('*, services(name), staff(name)')
      .single()

    if (error) throw error

    try {
      const { data: notifSettings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('business_id', business_id)
        .single()

      if (notifSettings?.send_owner_notification && notifSettings?.owner_email) {
        await sendOwnerNotification(booking, notifSettings.owner_email)
      }
    } catch (e) {
      console.error('Owner notification error (non-fatal):', e)
    }

    return NextResponse.json({ booking })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')
    const staff_id = searchParams.get('staff_id')
    const date = searchParams.get('date')

    if (!business_id) return NextResponse.json({ error: 'business_id required' }, { status: 400 })

    let query = supabase
      .from('bookings')
      .select('*, services(name, duration_minutes), staff(name)')
      .eq('business_id', business_id)
      .order('starts_at', { ascending: true })

    if (staff_id) query = query.eq('staff_id', staff_id)
    if (date) {
      query = query
        .gte('starts_at', `${date}T00:00:00`)
        .lte('starts_at', `${date}T23:59:59`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ bookings: data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}