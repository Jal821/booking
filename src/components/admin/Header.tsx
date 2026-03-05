'use client'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Booking Management
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Test Salon</span>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
          A
        </div>
      </div>
    </header>
  )
}
