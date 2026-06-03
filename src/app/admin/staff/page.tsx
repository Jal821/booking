export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const BUSINESS_ID = 'c0e500b6-de3b-4c5b-a2de-0832b85b9934'
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', google_calendar_id: '', telegram_chat_id: '' })

  const fetchStaff = async () => {
    const res = await fetch(`/api/staff?business_id=${BUSINESS_ID}`)
    const data = await res.json()
    setStaff(data.staff || [])
    setLoading(false)
  }

  useEffect(() => { fetchStaff() }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: BUSINESS_ID, ...form }),
    })
    setShowForm(false)
    setForm({ name: '', email: '', phone: '', google_calendar_id: '', telegram_chat_id: '' })
    fetchStaff()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return
    await fetch(`/api/staff?id=${id}`, { method: 'DELETE' })
    fetchStaff()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Add Staff
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', placeholder: 'Jana Novakova', required: true },
            { label: 'Email', key: 'email', placeholder: 'jana@salon.sk' },
            { label: 'Phone', key: 'phone', placeholder: '+421900000000' },
            { label: 'Google Calendar ID', key: 'google_calendar_id', placeholder: 'xxx@group.calendar.google.com' },
            { label: 'Telegram Chat ID', key: 'telegram_chat_id', placeholder: '123456789' },
          ].map(({ label, key, placeholder, required }) => (
            <div key={key}>
              <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>
              <input
                required={required}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Staff</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/staff/${member.id}`}
                    className="text-indigo-600 text-sm hover:text-indigo-800 font-medium">Edit</Link>
                  <button onClick={() => handleDelete(member.id)}
                    className="text-red-500 text-sm hover:text-red-700">Delete</button>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {DAYS.map((day, i) => (
                  <span key={day} className={`text-xs px-2 py-1 rounded-full font-medium ${
                    i >= 1 && i <= 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>{day}</span>
                ))}
              </div>
              {member.telegram_chat_id && (
                <p className="text-xs text-gray-400 mt-2">💬 Telegram connected</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
