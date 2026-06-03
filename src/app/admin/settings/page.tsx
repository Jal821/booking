'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useBusinessId } from '@/hooks/useBusinessId'

export default function SettingsPage() {
  const { businessId, loading: bizLoading } = useBusinessId()
  const [activeTab, setActiveTab] = useState('booking')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [rules, setRules] = useState({
    min_notice_hours: 2, max_advance_days: 60,
    max_daily_bookings: 20, slot_interval_minutes: 15,
  })
  const [notif, setNotif] = useState({
    confirmation_email_enabled: true, reminder_email_enabled: true,
    reminder_hours_before: 24, review_email_enabled: true,
    review_hours_after: 3, owner_email_enabled: true,
    owner_email: '', owner_telegram_enabled: false, owner_telegram_chat_id: '',
  })

  useEffect(() => {
    if (!businessId) return
    const load = async () => {
      const [r1, r2] = await Promise.all([
        fetch(`/api/settings?business_id=${businessId}`).then(r => r.json()),
        fetch(`/api/notifications?business_id=${businessId}`).then(r => r.json()),
      ])
      if (r1.rules) setRules(r1.rules)
      if (r2.settings) setNotif(r2.settings)
      setLoading(false)
    }
    load()
  }, [businessId])

  const handleSave = async (e: any) => {
    e.preventDefault()
    if (activeTab === 'booking') {
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_id: businessId, ...rules }) })
    } else {
      await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_id: businessId, ...notif }) })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (bizLoading || loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="flex gap-2 mb-6">
        {['booking', 'notifications'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {tab === 'booking' ? 'Booking Rules' : 'Notifications'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        {activeTab === 'booking' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Rules</h2>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Minimum notice (hours)</p>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={rules.min_notice_hours} onChange={e => setRules({ ...rules, min_notice_hours: Number(e.target.value) })} />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Maximum advance booking (days)</p>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={rules.max_advance_days} onChange={e => setRules({ ...rules, max_advance_days: Number(e.target.value) })} />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Max daily bookings per staff</p>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={rules.max_daily_bookings} onChange={e => setRules({ ...rules, max_daily_bookings: Number(e.target.value) })} />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Slot interval</p>
              <select className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" value={rules.slot_interval_minutes} onChange={e => setRules({ ...rules, slot_interval_minutes: Number(e.target.value) })}>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 60 minutes</option>
              </select>
            </div>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">Confirmation email</p>
              <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={notif.confirmation_email_enabled} onChange={e => setNotif({ ...notif, confirmation_email_enabled: e.target.checked })} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">Reminder email</p>
              <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={notif.reminder_email_enabled} onChange={e => setNotif({ ...notif, reminder_email_enabled: e.target.checked })} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">Review request email</p>
              <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={notif.review_email_enabled} onChange={e => setNotif({ ...notif, review_email_enabled: e.target.checked })} />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">Owner email notifications</p>
                <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={notif.owner_email_enabled} onChange={e => setNotif({ ...notif, owner_email_enabled: e.target.checked })} />
              </div>
              {notif.owner_email_enabled && (
                <input type="email" className="w-full border rounded px-3 py-1.5 text-sm text-gray-900" placeholder="owner@salon.sk" value={notif.owner_email} onChange={e => setNotif({ ...notif, owner_email: e.target.value })} />
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">Telegram notifications</p>
                <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={notif.owner_telegram_enabled} onChange={e => setNotif({ ...notif, owner_telegram_enabled: e.target.checked })} />
              </div>
              {notif.owner_telegram_enabled && (
                <input type="text" className="w-full border rounded px-3 py-1.5 text-sm text-gray-900" placeholder="Telegram Chat ID" value={notif.owner_telegram_chat_id} onChange={e => setNotif({ ...notif, owner_telegram_chat_id: e.target.value })} />
              )}
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          {saved && <p className="text-green-600 text-sm">Saved!</p>}
        </div>
      </form>
    </div>
  )
}
