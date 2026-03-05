import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const business_id = searchParams.get('business_id')
  if (!business_id) return NextResponse.json({ error: 'business_id required' }, { status: 400 })

  const { data: rules } = await supabase
    .from('booking_rules')
    .select('*')
    .eq('business_id', business_id)
    .single()

  return NextResponse.json({ rules })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { business_id, ...updates } = body
  if (!business_id) return NextResponse.json({ error: 'business_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('booking_rules')
    .upsert({ business_id, ...updates })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, rules: data })
}
