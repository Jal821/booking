import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')
    const staff_id = searchParams.get('staff_id')
    const year = parseInt(searchParams.get('year') ?? '')
    const month = parseInt(searchParams.get('month') ?? '')

    if (!business_id || isNaN(year) || isNaN(month))
      return NextResponse.json({ error: 'business_id, year, month required' }, { status: 400 })

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const allDates: string[] = []
    for (let d = 1; d <= daysInMonth; d++)
      allDates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)

    // First get staff IDs for this business
    const staffQuery = supabase
      .from('staff')
      .select('id')
      .eq('business_id', business_id)
    if (staff_id) staffQuery.eq('id', staff_id)
    const { data: staffRows } = await staffQuery
    const staffIds = (staffRows ?? []).map(s => s.id)

    if (staffIds.length === 0)
      return NextResponse.json({ available_dates: [] })

    // Now get working hours using staff IDs only
    const { data: staffHours } = await supabase
      .from('staff_hours')
      .select('staff_id, day_of_week, is_working')
      .in('staff_id', staffIds)

    // Get blocks for the month
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`
    const { data: blocks } = await supabase
      .from('staff_blocks')
      .select('staff_id, starts_at, ends_at')
      .in('staff_id', staffIds)
      .lte('starts_at', monthEnd)
      .gte('ends_at', monthStart)

    const availableDates = allDates.filter(dateStr => {
      const dow = new Date(dateStr + 'T12:00:00').getDay()
      const dayStart = dateStr + 'T00:00:00'
      const dayEnd = dateStr + 'T23:59:59'

      if (staff_id) {
        // Specific staff: must be working that day and not fully blocked
        const works = (staffHours ?? []).some(h => h.staff_id === staff_id && h.day_of_week === dow && h.is_working)
        if (!works) return false
        const blocked = (blocks ?? []).some(b =>
          b.staff_id === staff_id && b.starts_at <= dayStart && b.ends_at >= dayEnd
        )
        return !blocked
      } else {
        // Any staff: at least one must be working and not fully blocked
        return (staffHours ?? []).some(h => {
          if (!h.is_working || h.day_of_week !== dow) return false
          const blocked = (blocks ?? []).some(b =>
            b.staff_id === h.staff_id && b.starts_at <= dayStart && b.ends_at >= dayEnd
          )
          return !blocked
        })
      }
    })

    return NextResponse.json({ available_dates: availableDates })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}