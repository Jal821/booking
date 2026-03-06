"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

type Business = { id: string }
type Service = { id: string }
type Staff = { id?: string; name?: string }
type Slot = { start: string; end: string; available: boolean; staff_id?: string; staff_name?: string }

type Props = {
  business: Business
  service: Service
  staff?: Staff
  date: string
  onSelect: (args: { slot: Slot; staff: { id: string; name: string } }) => void
  onBack: () => void
}

export function SlotSelector({ business, service, staff, date, onSelect, onBack }: Props) {
  const [slots, setSlots] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true)
      setError("")
      setSlots(null)
      try {
        const staffParam = staff?.id ? `&staff_id=${staff.id}` : ""
        const url = `/api/slots?business_id=${business.id}&service_id=${service.id}&date=${date}${staffParam}`
        console.log("FETCH SLOTS URL", url, { businessId: business.id, serviceId: service.id, staffId: staff?.id, date })
        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()
        console.log("FETCH SLOTS RESPONSE", data)
        if (data.error) throw new Error(data.error)
        setSlots(data.staff_slots || [])
      } catch (e) {
        console.error(e)
        setError("Could not load available slots. Please try again.")
      }
      setLoading(false)
    }
    fetchSlots()
  }, [date, service?.id, staff?.id])

  const availableSlots: Slot[] =
    !slots || slots.length === 0
      ? []
      : staff?.id
      ? (slots.find((s) => s.staff_id === staff.id)?.slots ?? [])
          .filter((slot: Slot) => slot.available)
          .map((slot: Slot) => ({ ...slot, staff_id: staff.id, staff_name: staff.name || "" }))
      : slots.flatMap((s) =>
          (s.slots as Slot[])
            .filter((slot) => slot.available)
            .map((slot) => ({ ...slot, staff_id: s.staff_id, staff_name: s.staff_name }))
        )

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Select a Time</h2>
      <p className="text-gray-500 text-sm mb-6">
        Available slots for {format(new Date(date + "T12:00:00"), "EEEE, MMMM d yyyy")}
        {staff?.name ? ` · ${staff.name}` : ""}
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
            <button
              key={i}
              onClick={() => onSelect({ slot, staff: { id: slot.staff_id!, name: slot.staff_name! } })}
              className="py-3 px-2 text-center rounded-xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
            >
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700">
                {format(new Date(slot.start), "HH:mm")}
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
