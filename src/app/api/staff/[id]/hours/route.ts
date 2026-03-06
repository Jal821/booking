import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('staff_working_hours')
    .select('*')
    .eq('staff_id', id)
    .order('day_of_week')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ hours: data })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { hours } = await req.json()

    const rows = hours.map((h: any) => {
      const start = h.start_time || '09:00'
      const end = h.end_time || '17:00'
      return {
        staff_id: id,
        day_of_week: h.day_of_week,
        is_working: h.is_working,
        start_time: start,
        end_time: end,
        break_start: h.is_working && h.break_start ? h.break_start : null,
        break_end: h.is_working && h.break_end ? h.break_end : null,
      }
    })

    const { error } = await supabase
      .from('staff_working_hours')
      .upsert(rows, { onConflict: 'staff_id,day_of_week' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}