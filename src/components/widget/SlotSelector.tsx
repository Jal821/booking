import { useEffect, useState } from 'react'
import { format } from 'date-fns'

export function SlotSelector({ business, service, staff, date, onSelect, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true)
      setError('')
      try {
        const staffParam = staff?.id ? `&staff_id=${staff.id}` : ''
        const res = await fetch(
          `/api/slots?business_id=${business.id}&service_id=${service.id}&date=${date}${staffParam}`
        )
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setSlots(data.staff_slots || [])
      } catch (e) {
        setError('Could not load available slots. Please try again.')
      }
      setLoading(false)
    }
    fetchSlots()
  }, [date, service, staff])

  // If specific staff selected — only show their slots, no auto-switching
  const availableSlots = staff?.id
    ? (slots.find(s => s.staff_id === staff.id)?.slots ?? [])
        .filter(slot => slot.available)
        .map(slot => ({ ...slot, staff_id: staff.id, staff_name: staff.name }))
    : slots.flatMap(s =>
        s.slots
          .filter(slot => slot.available)
          .map(slot => ({ ...slot, staff_id: s.staff_id, staff_name: s.staff_name }))
      )

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Select a Time</h2>
      <p className="text-gray-500 text-sm mb-6">
        Available slots for {format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d yyyy')}
        {staff?.name ? ` · ${staff.name}` : ''}
      </p>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading available slots...</p>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

      {!loading && !error && availableSlots.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No available slots for this date</p>
          <button onClick={onBack} className="mt-3 text-sm text-indigo-600 hover:text-indigo-800">
            Choose another date
          </button>
        </div>
      )}

      {!loading && availableSlots.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map((slot, i) => (
            <button key={i}
              onClick={() => onSelect({ slot, staff: { id: slot.staff_id, name: slot.staff_name } })}
              className="py-3 px-2 text-center rounded-xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700">
                {format(new Date(slot.start), 'HH:mm')}
              </p>
              {!staff?.id && <p className="text-xs text-gray-400 mt-0.5">{slot.staff_name}</p>}
            </button>
          ))}
        </div>
      )}

      <button onClick={onBack} className="mt-6 text-sm text-indigo-600 hover:text-indigo-800">
        ← Back to calendar
      </button>
    </div>
  )
}