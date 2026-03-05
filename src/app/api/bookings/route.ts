import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createCalendarEvent } from '@/lib/google-calendar'
import { sendConfirmationEmail, sendOwnerNotificationEmail } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'
import { addMinutes } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      business_id, staff_id, service_id,
      client_name, client_email, client_phone,
      starts_at, notes,
    } = body

    if (!business_id || !staff_id || !service_id || !client_name || !client_email || !starts_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [{ data: service }, { data: staff }, { data: business }, { data: notifSettings }] = await Promise.all([
      supabase.from('services').select('*').eq('id', service_id).single(),
      supabase.from('staff').select('*').eq('id', staff_id).single(),
      supabase.from('businesses').select('*').eq('id', business_id).single(),
      supabase.from('notification_settings').select('*').eq('business_id', business_id).single(),
    ])

    if (!service || !staff || !business) {
      return NextResponse.json({ error: 'Invalid service, staff or business' }, { status: 404 })
    }

    const startDate = new Date(starts_at)
    const endDate = addMinutes(startDate, service.duration_minutes)
    const ends_at = endDate.toISOString()

    // Check conflicts
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('staff_id', staff_id)
      .eq('status', 'confirmed')
      .lt('starts_at', ends_at)
      .gt('ends_at', starts_at)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 })
    }

    // Try Google Calendar
    let google_event_id = null
    if (staff.google_calendar_id) {
      try {
        const event = await createCalendarEvent(
          staff.google_calendar_id,
          `${client_name} - ${service.name}`,
          `Phone: ${client_phone || 'N/A'}\nEmail: ${client_email}\nNotes: ${notes || 'N/A'}`,
          starts_at,
          ends_at,
          client_email,
          business.timezone
        )
        google_event_id = event.id
      } catch (calErr) {
        console.warn('Google Calendar error (non-fatal):', calErr)
      }
    }

    // Save booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        business_id, staff_id, service_id,
        client_name, client_email, client_phone,
        starts_at, ends_at, notes,
        google_event_id,
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) throw error

    // Send notifications (non-blocking)
    const notifPromises = []

    // Confirmation email to client
    if (notifSettings?.confirmation_email_enabled) {
      notifPromises.push(
        sendConfirmationEmail({
          clientName: client_name,
          clientEmail: client_email,
          serviceName: service.name,
          staffName: staff.name,
          startsAt: starts_at,
          endsAt: ends_at,
          businessName: business.name,
          bookingId: booking.id,
        }).catch(e => console.warn('Confirmation email error:', e))
      )
    }

    // Owner email notification
    if (notifSettings?.owner_email_enabled && notifSettings?.owner_email) {
      notifPromises.push(
        sendOwnerNotificationEmail({
          ownerEmail: notifSettings.owner_email,
          clientName: client_name,
          clientEmail: client_email,
          clientPhone: client_phone || 'N/A',
          serviceName: service.name,
          staffName: staff.name,
          startsAt: starts_at,
          businessName: business.name,
        }).catch(e => console.warn('Owner email error:', e))
      )
    }

    // Owner Telegram notification
    if (notifSettings?.owner_telegram_enabled && notifSettings?.owner_telegram_chat_id) {
      const date = new Date(starts_at).toLocaleDateString('sk-SK', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
      const time = new Date(starts_at).toLocaleTimeString('sk-SK', {
        hour: '2-digit', minute: '2-digit'
      })
      notifPromises.push(
        sendTelegramMessage({
          chatId: notifSettings.owner_telegram_chat_id,
          message: `New booking!\n\nClient: <b>${client_name}</b>\nPhone: ${client_phone || 'N/A'}\nService: <b>${service.name}</b>\nStaff: ${staff.name}\nDate: ${date}\nTime: <b>${time}</b>`,
        }).catch(e => console.warn('Telegram error:', e))
      )
    }

    await Promise.allSettled(notifPromises)

    return NextResponse.json({ success: true, booking }, { status: 201 })

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

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('bookings')
      .select(`*, service:services(name, duration_minutes, color), staff:staff(name)`)
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
