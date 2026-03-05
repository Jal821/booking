import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  // Simple auth check
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all businesses with reminder enabled
    const { data: businesses } = await supabase
      .from('notification_settings')
      .select('*, businesses(name, timezone)')
      .eq('reminder_email_enabled', true)

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No businesses with reminders enabled' })
    }

    let sent = 0

    for (const notif of businesses) {
      const hoursBeforeMs = notif.reminder_hours_before * 60 * 60 * 1000
      const now = new Date()
      const windowStart = new Date(now.getTime() + hoursBeforeMs - 5 * 60 * 1000)
      const windowEnd = new Date(now.getTime() + hoursBeforeMs + 5 * 60 * 1000)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, service:services(name), staff:staff(name)')
        .eq('business_id', notif.business_id)
        .eq('status', 'confirmed')
        .eq('reminder_sent', false)
        .gte('starts_at', windowStart.toISOString())
        .lte('starts_at', windowEnd.toISOString())

      if (!bookings || bookings.length === 0) continue

      for (const booking of bookings) {
        try {
          await sendReminderEmail({
            clientName: booking.client_name,
            clientEmail: booking.client_email,
            serviceName: booking.service?.name || '',
            staffName: booking.staff?.name || '',
            startsAt: booking.starts_at,
            businessName: notif.businesses?.name || '',
          })

          await supabase
            .from('bookings')
            .update({ reminder_sent: true })
            .eq('id', booking.id)

          sent++
        } catch (e) {
          console.warn('Reminder email failed for booking', booking.id, e)
        }
      }
    }

    return NextResponse.json({ success: true, sent })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
