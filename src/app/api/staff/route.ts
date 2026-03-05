import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/staff?business_id=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get('business_id')

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        staff_services(
          service:services(id, name, color)
        )
      `)
      .eq('business_id', business_id)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ staff: data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/staff - create staff member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      business_id,
      name,
      email,
      phone,
      google_calendar_id,
      working_hours,
      service_ids, // array of service IDs this staff can do
    } = body

    if (!business_id || !name) {
      return NextResponse.json({ error: 'business_id and name are required' }, { status: 400 })
    }

    // Create staff member
    const { data: staff, error } = await supabase
      .from('staff')
      .insert({
        business_id,
        name,
        email,
        phone,
        google_calendar_id,
        working_hours: working_hours || {
          mon: { start: '09:00', end: '17:00', active: true },
          tue: { start: '09:00', end: '17:00', active: true },
          wed: { start: '09:00', end: '17:00', active: true },
          thu: { start: '09:00', end: '17:00', active: true },
          fri: { start: '09:00', end: '17:00', active: true },
          sat: { start: '09:00', end: '13:00', active: false },
          sun: { start: '09:00', end: '13:00', active: false },
        },
      })
      .select()
      .single()

    if (error) throw error

    // Link services to staff
    if (service_ids && service_ids.length > 0) {
      const { error: linkError } = await supabase
        .from('staff_services')
        .insert(
          service_ids.map((service_id: string) => ({
            staff_id: staff.id,
            service_id,
          }))
        )
      if (linkError) throw linkError
    }

    return NextResponse.json({ success: true, staff }, { status: 201 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/staff - update staff member
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, service_ids, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update service links if provided
    if (service_ids) {
      await supabase.from('staff_services').delete().eq('staff_id', id)
      if (service_ids.length > 0) {
        await supabase.from('staff_services').insert(
          service_ids.map((service_id: string) => ({
            staff_id: id,
            service_id,
          }))
        )
      }
    }

    return NextResponse.json({ success: true, staff: data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/staff
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
