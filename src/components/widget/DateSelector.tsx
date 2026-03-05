import { useState } from 'react'
import { addDays, format, isBefore, startOfDay } from 'date-fns'

export function DateSelector({ business, service, staff, onSelect, onBack }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 60)

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const monthLabel = format(currentMonth, 'MMMM yyyy')

  const isDisabled = (date) => {
    if (!date) return true
    if (isBefore(date, today)) return true
    if (isBefore(maxDate, date)) return true
    return date.getDay() === 0
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Date</h2>
      <p className="text-gray-500 text-sm mb-6">Pick your preferred date</p>

      <div className="border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-gray-200 rounded-lg text-gray-600">&lt;</button>
          <span className="font-semibold text-gray-800">{monthLabel}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-gray-200 rounded-lg text-gray-600">&gt;</button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => (
              <button key={i} disabled={isDisabled(date)}
                onClick={() => date && !isDisabled(date) && onSelect(format(date, 'yyyy-MM-dd'))}
                className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                  !date ? 'invisible' :
                  isDisabled(date) ? 'text-gray-300 cursor-not-allowed' :
                  'text-gray-800 hover:bg-indigo-100 hover:text-indigo-700'
                }`}>
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onBack} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800">
        ← Back
      </button>
    </div>
  )
}