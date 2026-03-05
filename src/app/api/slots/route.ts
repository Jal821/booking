import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAvailableSlots } from '@/lib/google-calendar'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')
    const service_id = searchParams.get('service_id')
    const staff_id = searchParams.get('staff_id')
    const date = searchParams.get('date')

    if (!business_id || !service_id || !date)
      return NextResponse.json({ error: 'business_id, service_id and date are required' }, { status: 400 })

    const { data: business } = await supabase
      .from('businesses').select('timezone').eq('id', business_id).single()
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    const { data: service } = await supabase
      .from('services').select('duration_minutes, cleanup_minutes').eq('id', service_id).single()
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

    const { data: rules } = await supabase
      .from('booking_rules').select('slot_interval_minutes').eq('business_id', business_id).single()
    const slotInterval = rules?.slot_interval_minutes || 15

    const staffQuery = supabase
      .from('staff').select('id, name, google_calendar_id, working_hours').eq('business_id', business_id)
    if (staff_id) staffQuery.eq('id', staff_id)
    const { data: staffList } = await staffQuery

    if (!staffList || staffList.length === 0)
      return NextResponse.json({ error: 'No staff found' }, { status: 404 })

    // Fetch break times from staff_hours for the specific day of week
    const dayOfWeek = new Date(date + 'T12:00:00').getDay()
    const { data: staffHoursRows } = await supabase
      .from('staff_hours')
      .select('staff_id, break_start, break_end, is_working, start_time, end_time')
      .in('staff_id', staffList.map(s => s.id))
      .eq('day_of_week', dayOfWeek)

    const staffHoursMap: Record<string, any> = {}
    for (const row of staffHoursRows ?? []) staffHoursMap[row.staff_id] = row

    // Fetch active blocks for this date
    const dayStart = `${date}T00:00:00`
    const dayEnd = `${date}T23:59:59`
    const { data: blocks } = await supabase
      .from('staff_blocks')
      .select('staff_id, starts_at, ends_at')
      .in('staff_id', staffList.map(s => s.id))
      .lte('starts_at', dayEnd)
      .gte('ends_at', dayStart)

    const blocksMap: Record<string, { starts_at: string; ends_at: string }[]> = {}
    for (const b of blocks ?? []) {
      if (!blocksMap[b.staff_id]) blocksMap[b.staff_id] = []
      blocksMap[b.staff_id].push(b)
    }

    const results = await Promise.all(
      staffList.map(async (member) => {
        if (!member.google_calendar_id) return null

        const hoursRow = staffHoursMap[member.id]

        // Prefer staff_hours table; fall back to working_hours JSON on staff row
        let isWorking = hoursRow?.is_working
        let startTime = hoursRow?.start_time
        let endTime = hoursRow?.end_time

        if (isWorking === undefined) {
          const dayKey = new Date(date + 'T12:00:00')
            .toLocaleDateString('en-US', { weekday: 'short' })
            .toLowerCase().slice(0, 3) as keyof typeof member.working_hours
          const wh = member.working_hours?.[dayKey]
          isWorking = wh?.active
          startTime = wh?.start
          endTime = wh?.end
        }

        if (!isWorking) return null

        // Check for full-day block
        const memberBlocks = blocksMap[member.id] ?? []
        const fullDayBlock = memberBlocks.find(b =>
          b.starts_at <= dayStart && b.ends_at >= dayEnd
        )
        if (fullDayBlock) return null

        let slots = await getAvailableSlots(
          member.google_calendar_id,
          date,
          business.timezone,
          startTime,
          endTime,
          service.duration_minutes,
          service.cleanup_minutes,
          slotInterval
        )

        // Remove slots that fall inside a break
        const breakStart = hoursRow?.break_start
        const breakEnd = hoursRow?.break_end
        if (breakStart && breakEnd) {
          slots = slots.map(slot => {
            const t = format(new Date(slot.start), 'HH:mm')
            const blocked = t >= breakStart && t < breakEnd
            return blocked ? { ...slot, available: false } : slot
          })
        }

        // Remove slots that overlap any partial block
        const partialBlocks = memberBlocks.filter(b => !(b.starts_at <= dayStart && b.ends_at >= dayEnd))
        if (partialBlocks.length > 0) {
          slots = slots.map(slot => {
            const slotStart = new Date(slot.start).toISOString()
            const slotEnd = new Date(slot.end).toISOString()
            const blocked = partialBlocks.some(b => slotStart < b.ends_at && slotEnd > b.starts_at)
            return blocked ? { ...slot, available: false } : slot
          })
        }

        return { staff_id: member.id, staff_name: member.name, slots }
      })
    )

    return NextResponse.json({ date, service_id, staff_slots: results.filter(Boolean) })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}