import { useState } from 'react'
import { format } from 'date-fns'

export function BookingForm({ business, service, staff, slot, onComplete, onBack }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          staff_id: staff.id,
          service_id: service.id,
          client_name: form.name,
          client_email: form.email,
          client_phone: form.phone,
          starts_at: slot.start,
          notes: form.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      onComplete(data.booking)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your Details</h2>
      <p className="text-gray-500 text-sm mb-6">Almost done! Fill in your contact info</p>

      <div className="bg-indigo-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Service</p>
            <p className="font-semibold text-gray-900">{service.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Staff</p>
            <p className="font-semibold text-gray-900">{staff.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-semibold text-gray-900">
              {format(new Date(slot.start), 'EEE, MMM d yyyy')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Time</p>
            <p className="font-semibold text-gray-900">
              {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-semibold text-gray-900">{service.duration_minutes} min</p>
          </div>
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-semibold text-gray-900">{service.price} {service.currency}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Full Name</p>
          <input
            required
            className="w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Jana Novakova"
          />
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Email</p>
          <input
            required
            type="email"
            className="w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="jana@email.sk"
          />
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Phone</p>
          <input
            className="w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+421900000000"
          />
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</p>
          <textarea
            className="w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Any special requests or notes..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
