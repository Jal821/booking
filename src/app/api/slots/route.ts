import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAvailableSlots } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')
    const service_id = searchParams.get('service_id')
    const staff_id = searchParams.get('staff_id')
    const date = searchParams.get('date') // YYYY-MM-DD

    if (!business_id || !service_id || !date) {
      return NextResponse.json({ error: 'business_id, service_id and date are required' }, { status: 400 })
    }

    // Get business timezone
    const { data: business } = await supabase
      .from('businesses')
      .select('timezone')
      .eq('id', business_id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    // Get service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes, cleanup_minutes')
      .eq('id', service_id)
      .single()

    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

    // Get booking rules
    const { data: rules } = await supabase
      .from('booking_rules')
      .select('slot_interval_minutes, min_notice_hours, max_advance_days')
      .eq('business_id', business_id)
      .single()

    const slotInterval = rules?.slot_interval_minutes || 15

    // Get staff
    const staffQuery = supabase
      .from('staff')
      .select('id, name, google_calendar_id, working_hours')
      .eq('business_id', business_id)

    if (staff_id) staffQuery.eq('id', staff_id)

    const { data: staffList } = await staffQuery

    if (!staffList || staffList.length === 0) {
      return NextResponse.json({ error: 'No staff found' }, { status: 404 })
    }

    // Get slots for each staff member
    const results = await Promise.all(
      staffList.map(async (member) => {
        if (!member.google_calendar_id) return null

        const dayKey = new Date(date)
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase()
          .slice(0, 3) as keyof typeof member.working_hours

        const hours = member.working_hours?.[dayKey]
        if (!hours?.active) return null

        const slots = await getAvailableSlots(
          member.google_calendar_id,
          date,
          business.timezone,
          hours.start,
          hours.end,
          service.duration_minutes,
          service.cleanup_minutes,
          slotInterval
        )

        return {
          staff_id: member.id,
          staff_name: member.name,
          slots,
        }
      })
    )

    return NextResponse.json({
      date,
      service_id,
      staff_slots: results.filter(Boolean),
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
