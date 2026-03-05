import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const business_id = req.nextUrl.searchParams.get('business_id')
  if (!business_id) return NextResponse.json({ error: 'business_id required' }, { status: 400 })
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('business_id', business_id)
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { business_id, name, email, phone, google_calendar_id, telegram_chat_id, service_ids } = body
  const { data, error } = await supabase
    .from('staff')
    .insert({ business_id, name, email, phone, google_calendar_id, telegram_chat_id, service_ids: service_ids ?? [] })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert default working hours
  const defaultHours = [0,1,2,3,4,5,6].map(day => ({
    staff_id: data.id,
    day_of_week: day,
    start_time: '09:00',
    end_time: '17:00',
    is_working: day >= 1 && day <= 5,
  }))
  await supabase.from('staff_working_hours').insert(defaultHours)

  return NextResponse.json({ staff: data })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  const { data, error } = await supabase
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const { error } = await supabase.from('staff').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}