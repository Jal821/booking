import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/services?business_id=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', business_id)
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ services: data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/services - create service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      business_id,
      name,
      description,
      duration_minutes,
      cleanup_minutes,
      price,
      currency,
      color,
    } = body

    if (!business_id || !name || !duration_minutes) {
      return NextResponse.json({ error: 'business_id, name and duration_minutes are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('services')
      .insert({
        business_id,
        name,
        description,
        duration_minutes,
        cleanup_minutes: cleanup_minutes || 0,
        price,
        currency: currency || 'EUR',
        color: color || '#6366f1',
        active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, service: data }, { status: 201 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/services - update service
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, service: data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/services - deactivate service
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('services')
      .update({ active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
