-e 'use client'
export const dynamic = 'force-dynamic'
-e 
export const dynamic = 'force-dynamic'
import { dynamic } from 'next/dynamic'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function MasterAdminPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', slug: '', timezone: 'Europe/Bratislava', password: '' })
  const [error, setError] = useState('')
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  const fetchBusinesses = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })
    setBusinesses(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchBusinesses() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')

    const res = await fetch('/api/master/create-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create business')
      setCreating(false)
      return
    }

    setShowForm(false)
    setForm({ name: '', email: '', phone: '', address: '', slug: '', timezone: 'Europe/Bratislava', password: '' })
    fetchBusinesses()
    setCreating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Master Admin</h1>
          <p className="text-gray-400 text-xs mt-0.5">All businesses</p>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">
          Sign out
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Businesses</h2>
            <p className="text-sm text-gray-500">{businesses.length} total clients</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            + New Business
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Create New Business</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Salon Eva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug * (URL identifier)</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="salon-eva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email *</label>
                <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} placeholder="owner@salon.sk" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Password *</label>
                <input required type="password" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+421 900 000 000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.timezone}
                  onChange={e => setForm({ ...form, timezone: e.target.value })}>
                  <option value="Europe/Bratislava">Europe/Bratislava</option>
                  <option value="Europe/Zurich">Europe/Zurich</option>
                  <option value="Europe/Prague">Europe/Prague</option>
                  <option value="Europe/Vienna">Europe/Vienna</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Hlavná 1, Bratislava" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 mt-4 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setError('') }}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={creating}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Business'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No businesses yet. Create your first client.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{b.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(b.created_at).toLocaleDateString('sk-SK')}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/book/${b.slug}`} target="_blank"
                        className="text-indigo-600 text-sm hover:text-indigo-800 mr-3">Booking page ↗</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
