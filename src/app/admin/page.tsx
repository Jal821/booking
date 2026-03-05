import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'c0e500b6-de3b-4c5b-a2de-0832b85b9934'

async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalBookings }, { count: todayBookings }, { count: totalServices }, { count: totalStaff }] =
    await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', BUSINESS_ID),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', BUSINESS_ID).gte('starts_at', `${today}T00:00:00`).lte('starts_at', `${today}T23:59:59`),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('business_id', BUSINESS_ID).eq('active', true),
      supabase.from('staff').select('*', { count: 'exact', head: true }).eq('business_id', BUSINESS_ID),
    ])

  return { totalBookings, todayBookings, totalServices, totalStaff }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Total Bookings', value: stats.totalBookings ?? 0, color: 'bg-indigo-500' },
    { label: "Today's Bookings", value: stats.todayBookings ?? 0, color: 'bg-green-500' },
    { label: 'Active Services', value: stats.totalServices ?? 0, color: 'bg-purple-500' },
    { label: 'Staff Members', value: stats.totalStaff ?? 0, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
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
