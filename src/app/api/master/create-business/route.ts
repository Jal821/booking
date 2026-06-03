import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Create admin client inside handler so env vars are read at runtime not build time
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, password, phone, address, slug, timezone } = await req.json()

  const { data: existing } = await supabase.from('businesses').select('id').eq('slug', slug).single()
  if (existing) return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const newUserId = authData.user.id

  const { data: business, error: bizError } = await supabaseAdmin
    .from('businesses')
    .insert({ name, email, phone, address, slug, timezone, owner_user_id: newUserId })
    .select()
    .single()

  if (bizError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return NextResponse.json({ error: bizError.message }, { status: 400 })
  }

  await supabaseAdmin.from('profiles').upsert({ id: newUserId, role: 'business_owner' })
  await supabaseAdmin.from('booking_rules').insert({ business_id: business.id, min_notice_hours: 2, max_advance_days: 60, max_daily_bookings: 20, slot_interval_minutes: 15 })
  await supabaseAdmin.from('notification_settings').insert({ business_id: business.id, confirmation_email_enabled: true, reminder_email_enabled: true, reminder_hours_before: 24, review_email_enabled: true, review_hours_after: 3, owner_email_enabled: true, owner_email: email })

  return NextResponse.json({ success: true, business })
}
