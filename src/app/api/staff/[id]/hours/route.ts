import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULT_HOURS = [0,1,2,3,4,5,6].map(day => ({
  day_of_week: day,
  start_time: '09:00',
  end_time: '17:00',
  is_working: day >= 1 && day <= 5,
}))

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('staff_working_hours')
    .select('*')
    .eq('staff_id', id)
    .order('day_of_week')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ hours: DEFAULT_HOURS })
  return NextResponse.json({ hours: data })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { hours } = await req.json()
  const upserts = hours.map((h: any) => ({ staff_id: id, ...h }))
  const { error } = await supabase
    .from('staff_working_hours')
    .upsert(upserts, { onConflict: 'staff_id,day_of_week' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}