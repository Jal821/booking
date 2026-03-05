import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')
    const staff_id = searchParams.get('staff_id')
    const year = parseInt(searchParams.get('year') ?? '')
    const month = parseInt(searchParams.get('month') ?? '') // 0-indexed

    if (!business_id || isNaN(year) || isNaN(month))
      return NextResponse.json({ error: 'business_id, year, month required' }, { status: 400 })

    // Build all days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const allDates: string[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      allDates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }

    // Get staff working hours
    const staffQuery = supabase
      .from('staff_hours')
      .select('staff_id, day_of_week, is_working')
      .eq('business_id', business_id)
    if (staff_id) staffQuery.eq('staff_id', staff_id)
    const { data: staffHours } = await staffQuery

    // Get blocks covering any day of the month
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`
    const blocksQuery = supabase
      .from('staff_blocks')
      .select('staff_id, starts_at, ends_at')
      .lte('starts_at', monthEnd)
      .gte('ends_at', monthStart)
    if (staff_id) blocksQuery.eq('staff_id', staff_id)
    const { data: blocks } = await blocksQuery

    const availableDates = allDates.filter(dateStr => {
      const dow = new Date(dateStr + 'T12:00:00').getDay()
      const dayStart = dateStr + 'T00:00:00'
      const dayEnd = dateStr + 'T23:59:59'

      // At least one staff member must work this day
      const anyWorking = (staffHours ?? []).some(h => h.day_of_week === dow && h.is_working)
      if (!anyWorking) return false

      // If specific staff — check they're not fully blocked
      if (staff_id) {
        const fullDayBlock = (blocks ?? []).find(b =>
          b.staff_id === staff_id && b.starts_at <= dayStart && b.ends_at >= dayEnd
        )
        if (fullDayBlock) return false
      }

      return true
    })

    return NextResponse.json({ available_dates: availableDates })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}