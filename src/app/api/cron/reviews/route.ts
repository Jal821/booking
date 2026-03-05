import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const { data: settings } = await supabase.from('notification_settings').select('*')

    let sent = 0
    for (const setting of settings ?? []) {
      if (!setting.send_client_review) continue
      const windowStart = new Date(now.getTime() - setting.review_hours_after * 60 * 60 * 1000 - 15 * 60 * 1000)
      const windowEnd = new Date(now.getTime() - setting.review_hours_after * 60 * 60 * 1000 + 15 * 60 * 1000)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, services(name), staff(name)')
        .eq('business_id', setting.business_id)
        .eq('status', 'confirmed')
        .eq('review_sent', false)
        .gte('ends_at', windowStart.toISOString())
        .lte('ends_at', windowEnd.toISOString())

      for (const booking of bookings ?? []) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking, setting }),
          })
          await supabase.from('bookings').update({ review_sent: true }).eq('id', booking.id)
          sent++
        } catch (e) {
          console.error('Review failed for booking', booking.id, e)
        }
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}