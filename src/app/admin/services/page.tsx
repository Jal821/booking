-e 'use client'
export const dynamic = 'force-dynamic'
-e 
export const dynamic = 'force-dynamic'
import { dynamic } from 'next/dynamic'

import { useEffect, useState } from 'react'
import { useBusinessId } from '@/hooks/useBusinessId'

export default function ServicesPage() {
  const { businessId, loading: bizLoading } = useBusinessId()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: 60, cleanup_minutes: 10, price: 0, currency: 'EUR', color: '#6366f1' })

  const fetchServices = async () => {
    if (!businessId) return
    const res = await fetch(`/api/services?business_id=${businessId}`)
    const data = await res.json()
    setServices(data.services || [])
    setLoading(false)
  }

  useEffect(() => { if (businessId) fetchServices() }, [businessId])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_id: businessId, ...form }) })
    setShowForm(false)
    fetchServices()
  }

  const handleDelete = async (id: any) => {
    if (!confirm('Deactivate this service?')) return
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
    fetchServices()
  }

  if (bizLoading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Add Service</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="block text-sm font-medium text-gray-700 mb-1">Service Name</p>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Manikura" />
          </div>
          <div className="col-span-2">
            <p className="block text-sm font-medium text-gray-700 mb-1">Description</p>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</p>
            <input required type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Cleanup (minutes)</p>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.cleanup_minutes} onChange={e => setForm({ ...form, cleanup_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Price</p>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Color</p>
            <input type="color" className="w-full border rounded-lg px-3 py-2 h-10" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          </div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </form>
      )}
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any) => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: service.color }} />
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">{service.description}</p>
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>{service.duration_minutes} min</span>
                <span>{service.price} {service.currency}</span>
              </div>
              <button onClick={() => handleDelete(service.id)} className="text-red-500 text-sm hover:text-red-700">Deactivate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
