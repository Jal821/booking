'use client'
import { useEffect, useState } from 'react'

const BUSINESS_ID = 'c0e500b6-de3b-4c5b-a2de-0832b85b9934'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', google_calendar_id: '',
  })

  const fetchStaff = async () => {
    const res = await fetch(`/api/staff?business_id=${BUSINESS_ID}`)
    const data = await res.json()
    setStaff(data.staff || [])
    setLoading(false)
  }

  useEffect(() => { fetchStaff() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: BUSINESS_ID, ...form }),
    })
    setShowForm(false)
    setForm({ name: '', email: '', phone: '', google_calendar_id: '' })
    fetchStaff()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return
    await fetch(`/api/staff?id=${id}`, { method: 'DELETE' })
    fetchStaff()
  }

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

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
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Full Name</p>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jana Novakova" />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Email</p>
            <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jana@salon.sk" />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Phone</p>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+421900000000" />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Google Calendar ID</p>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.google_calendar_id}
              onChange={e => setForm({ ...form, google_calendar_id: e.target.value })}
              placeholder="xxx@group.calendar.google.com" />
          </div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Staff</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(member.id)}
                  className="text-red-500 text-sm hover:text-red-700">Delete</button>
              </div>
              <div className="flex gap-1 mt-3">
                {days.map(day => (
                  <span key={day} className={`text-xs px-2 py-1 rounded-full font-medium ${
                    member.working_hours?.[day]?.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {day.charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
              {member.google_calendar_id && (
                <p className="text-xs text-gray-400 mt-2">Cal: {member.google_calendar_id}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
