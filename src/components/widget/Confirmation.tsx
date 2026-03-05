import { format } from 'date-fns'

export function Confirmation({ booking, service, staff }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-500 text-sm mb-8">
        A confirmation email has been sent to {booking.client_email}
      </p>

      <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Service</span>
          <span className="font-semibold text-gray-900">{service.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Staff</span>
          <span className="font-semibold text-gray-900">{staff.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Date</span>
          <span className="font-semibold text-gray-900">
            {format(new Date(booking.starts_at), 'EEE, MMM d yyyy')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Time</span>
          <span className="font-semibold text-gray-900">
            {format(new Date(booking.starts_at), 'HH:mm')} - {format(new Date(booking.ends_at), 'HH:mm')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Price</span>
          <span className="font-semibold text-gray-900">{service.price} {service.currency}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-sm">
          <span className="text-gray-500">Booking ID</span>
          <span className="font-mono text-xs text-gray-400">{booking.id.slice(0, 8)}...</span>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
      >
        Book Another Appointment
      </button>
    </div>
  )
}
