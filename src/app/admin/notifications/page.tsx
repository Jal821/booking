'use client'
import { useEffect, useState } from 'react'

const BUSINESS_ID = 'c0e500b6-de3b-4c5b-a2de-0832b85b9934'

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    reminder_hours_before: 24,
    review_hours_after: 2,
    owner_email: '',
    send_owner_notification: true,
    send_client_reminder: true,
    send_client_review: true,
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/notifications?business_id=${BUSINESS_ID}`)
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings); setLoading(false) })
  }, [])

  const save = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: BUSINESS_ID, ...settings }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner notification email</label>
          <input
            type="email"
            value={settings.owner_email}
            onChange={e => setSettings({ ...settings, owner_email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send reminder (hours before appointment)</label>
          <input
            type="number"
            value={settings.reminder_hours_before}
            onChange={e => setSettings({ ...settings, reminder_hours_before: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send review request (hours after appointment)</label>
          <input
            type="number"
            value={settings.review_hours_after}
            onChange={e => setSettings({ ...settings, review_hours_after: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          {[
            { key: 'send_owner_notification', label: 'Notify owner on new booking' },
            { key: 'send_client_reminder', label: 'Send reminder email to client' },
            { key: 'send_client_review', label: 'Send review request to client' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings[key as keyof typeof settings] as boolean}
                onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={save}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
        >
          {saved ? '✅ Saved!' : 'Save Notification Settings'}
        </button>
      </div>
    </div>
  )
}
