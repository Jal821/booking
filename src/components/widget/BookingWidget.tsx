'use client'
import { useState } from 'react'
import { ServiceSelector } from './ServiceSelector'
import { DateSelector } from './DateSelector'
import { SlotSelector } from './SlotSelector'
import { BookingForm } from './BookingForm'
import { Confirmation } from './Confirmation'

const STEPS = ['Service', 'Date', 'Time', 'Details', 'Confirm']

export function BookingWidget({ business, services, staff }) {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(null)

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setStep(1)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setStep(2)
  }

  const handleSlotSelect = (slot, staffMember) => {
    setSelectedSlot(slot)
    setSelectedStaff(staffMember)
    setStep(3)
  }

  const handleBookingComplete = (bookingData) => {
    setBooking(bookingData)
    setStep(4)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                i < step ? 'bg-green-400 text-white' :
                i === step ? 'bg-white text-indigo-600' :
                'bg-indigo-500 text-indigo-200'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${
                i === step ? 'text-white font-medium' : 'text-indigo-300'
              }`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className="w-4 sm:w-8 h-px bg-indigo-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {step === 0 && (
          <ServiceSelector
            services={services}
            onSelect={handleServiceSelect}
          />
        )}
        {step === 1 && (
          <DateSelector
            business={business}
            onSelect={handleDateSelect}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <SlotSelector
            business={business}
            service={selectedService}
            staff={staff}
            date={selectedDate}
            onSelect={handleSlotSelect}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <BookingForm
            business={business}
            service={selectedService}
            staff={selectedStaff}
            slot={selectedSlot}
            onComplete={handleBookingComplete}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
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
