import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendReviewEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: businesses } = await supabase
      .from('notification_settings')
      .select('*, businesses(name)')
      .eq('review_email_enabled', true)

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No businesses with reviews enabled' })
    }

    let sent = 0

    for (const notif of businesses) {
      const hoursAfterMs = notif.review_hours_after * 60 * 60 * 1000
      const now = new Date()
      const windowStart = new Date(now.getTime() - hoursAfterMs - 5 * 60 * 1000)
      const windowEnd = new Date(now.getTime() - hoursAfterMs + 5 * 60 * 1000)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, service:services(name)')
        .eq('business_id', notif.business_id)
        .eq('status', 'confirmed')
        .eq('review_sent', false)
        .gte('ends_at', windowStart.toISOString())
        .lte('ends_at', windowEnd.toISOString())

      if (!bookings || bookings.length === 0) continue

      for (const booking of bookings) {
        try {
          await sendReviewEmail({
            clientName: booking.client_name,
            clientEmail: booking.client_email,
            serviceName: booking.service?.name || '',
            businessName: notif.businesses?.name || '',
            bookingId: booking.id,
          })

          await supabase
            .from('bookings')
            .update({ review_sent: true })
            .eq('id', booking.id)

          sent++
        } catch (e) {
          console.warn('Review email failed for booking', booking.id, e)
        }
      }
    }

    return NextResponse.json({ success: true, sent })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
