'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBusinessId } from '@/hooks/useBusinessId'

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function StaffPage() {
  const { businessId, loading: bizLoading } = useBusinessId()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', google_calendar_id: '', telegram_chat_id: '' })

  const fetchStaff = async () => {
    if (!businessId) return
    const res = await fetch(`/api/staff?business_id=${businessId}`)
    const data = await res.json()
    setStaff(data.staff || [])
    setLoading(false)
  }

  useEffect(() => { if (businessId) fetchStaff() }, [businessId])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_id: businessId, ...form }) })
    setShowForm(false)
    setForm({ name: '', email: '', phone: '', google_calendar_id: '', telegram_chat_id: '' })
    fetchStaff()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member?')) return
    await fetch(`/api/staff?id=${id}`, { method: 'DELETE' })
    fetchStaff()
  }

  if (bizLoading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Add Staff</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Calendar ID</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.google_calendar_id} onChange={e => setForm({ ...form, google_calendar_id: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Chat ID</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.telegram_chat_id} onChange={e => setForm({ ...form, telegram_chat_id: e.target.value })} />
          </div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </form>
      )}
      {loading ? <p className="text-gray-500">Loading...</p> : staff.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">No staff yet. Add your first team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href={`/admin/staff/${member.id}`} className="text-indigo-600 text-sm hover:text-indigo-800">Schedule</Link>
                <button onClick={() => handleDelete(member.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
