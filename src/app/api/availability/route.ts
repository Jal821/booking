import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DOW_KEY = ['sun','mon','tue','wed','thu','fri','sat']

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

    const staffQuery = supabase.from('staff').select('id, working_hours').eq('business_id', business_id)
    if (staff_id) staffQuery.eq('id', staff_id)
    const { data: staffRows } = await staffQuery
    if (!staffRows || staffRows.length === 0) return NextResponse.json({ available_dates: [] })

    const staffIds = staffRows.map(s => s.id)
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`

    const { data: blocks } = await supabase
      .from('staff_time_blocks')
      .select('staff_id, starts_at, ends_at')
      .in('staff_id', staffIds)
      .lte('starts_at', monthEnd)
      .gte('ends_at', monthStart)

    const availableDates = allDates.filter(dateStr => {
      const dow = new Date(dateStr + 'T12:00:00').getDay()
      const key = DOW_KEY[dow]
      const dayStart = dateStr + 'T00:00:00'
      const dayEnd = dateStr + 'T23:59:59'

      return staffRows.some(s => {
        const wh = s.working_hours?.[key]
        if (!wh?.active) return false
        const fullyBlocked = (blocks ?? []).some(b =>
          b.staff_id === s.id && b.starts_at <= dayStart && b.ends_at >= dayEnd
        )
        return !fullyBlocked
      })
    })

    return NextResponse.json({ available_dates: availableDates })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}