'use client'
import { useState } from 'react'
import { ServiceSelector } from './ServiceSelector'
import { StaffSelector } from './StaffSelector'
import { DateSelector } from './DateSelector'
import { SlotSelector } from './SlotSelector'
import { BookingForm } from './BookingForm'
import { Confirmation } from './Confirmation'

const STEPS = ['Service', 'Staff', 'Date', 'Time', 'Details', 'Confirm']

export function BookingWidget({ business, services, staff }) {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(null)

  const availableStaff = selectedService
    ? staff.filter(s => !s.service_ids?.length || s.service_ids.includes(selectedService.id))
    : staff

  const handleBookingComplete = (b) => { setBooking(b); setStep(5) }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 text-center text-xs font-medium py-1 ${
              i === step ? 'text-indigo-600' : i < step ? 'text-green-500' : 'text-gray-300'
            }`}>{i < step ? '✓' : s}</div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {step === 0 && (
          <ServiceSelector
            services={services}
            onSelect={s => { setSelectedService(s); setStep(1) }}
          />
        )}
        {step === 1 && (
          <StaffSelector
            staff={availableStaff}
            onSelect={s => { setSelectedStaff(s); setStep(2) }}
            onBack={() => setStep(0)}
            allowAny={availableStaff.length > 1}
          />
        )}
        {step === 2 && (
          <DateSelector
            business={business}
            service={selectedService}
            staff={selectedStaff}
            onSelect={d => { setSelectedDate(d); setStep(3) }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <SlotSelector
            business={business}
            service={selectedService}
            staff={selectedStaff}
            date={selectedDate}
            onSelect={({ slot, staff: s }) => { setSelectedSlot(slot); setSelectedStaff(s); setStep(4) }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <BookingForm
            business={business}
            service={selectedService}
            staff={selectedStaff}
            slot={selectedSlot}
            onComplete={handleBookingComplete}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <Confirmation
            booking={booking}
            service={selectedService}
            staff={selectedStaff}
          />
        )}
      </div>
    </div>
  )
}