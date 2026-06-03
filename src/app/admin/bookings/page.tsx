'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useBusinessId } from '@/hooks/useBusinessId'

export default function BookingsPage() {
  const { businessId, loading: bizLoading } = useBusinessId()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const fetchBookings = async () => {
    if (!businessId) return
    setLoading(true)
    const res = await fetch(`/api/bookings?business_id=${businessId}&date=${date}`)
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(() => { if (businessId) fetchBookings() }, [date, businessId])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' })
    fetchBookings()
  }

  const statusColor = (status: string) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (bizLoading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">No bookings for this date</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(booking.starts_at).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(booking.ends_at).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{booking.client_name}</p>
                    <p className="text-xs text-gray-500">{booking.client_email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{booking.service?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{booking.staff?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(booking.status)}`}>{booking.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === 'confirmed' && (
                      <button onClick={() => handleCancel(booking.id)} className="text-red-500 text-sm hover:text-red-700">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
