export const dynamic = 'force-dynamic'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

async function getDashboardStats(businessId: string) {
  const { createSupabaseServerClient } = await import('@/lib/supabase-server')
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalBookings }, { count: todayBookings }, { count: totalServices }, { count: totalStaff }] =
    await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('starts_at', `${today}T00:00:00`).lte('starts_at', `${today}T23:59:59`),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('active', true),
      supabase.from('staff').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    ])

  return { totalBookings, todayBookings, totalServices, totalStaff }
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_user_id', user.id).single()
  if (!business) return <div className="p-6 text-gray-500">No business linked to your account. Contact your administrator.</div>

  const stats = await getDashboardStats(business.id)

  const cards = [
    { label: 'Total Bookings', value: stats.totalBookings ?? 0, color: 'bg-indigo-500' },
    { label: "Today's Bookings", value: stats.todayBookings ?? 0, color: 'bg-green-500' },
    { label: 'Active Services', value: stats.totalServices ?? 0, color: 'bg-purple-500' },
    { label: 'Staff Members', value: stats.totalStaff ?? 0, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">{business.name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">{card.value}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
