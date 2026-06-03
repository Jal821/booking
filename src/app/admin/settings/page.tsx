export const dynamic = 'force-dynamic'
﻿
import { useEffect, useState } from 'react'

const BUSINESS_ID = 'c0e500b6-de3b-4c5b-a2de-0832b85b9934'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('booking')
  const [saved, setSaved] = useState(false)

  const [rules, setRules] = useState({
    min_notice_hours: 2,
    max_advance_days: 60,
    max_daily_bookings: 20,
    slot_interval_minutes: 15,
  })

  const [notif, setNotif] = useState({
    confirmation_email_enabled: true,
    reminder_email_enabled: true,
    reminder_hours_before: 24,
    review_email_enabled: true,
    review_hours_after: 3,
    owner_email_enabled: true,
    owner_email: '',
    owner_telegram_enabled: false,
    owner_telegram_chat_id: '',
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch2 = async () => {
      const [r1, r2] = await Promise.all([
        fetch(`/api/settings?business_id=${BUSINESS_ID}`).then(r => r.json()),
        fetch(`/api/notifications?business_id=${BUSINESS_ID}`).then(r => r.json()),
      ])
      if (r1.rules) setRules(r1.rules)
      if (r2.settings) setNotif(r2.settings)
      setLoading(false)
    }
    fetch2()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (activeTab === 'booking') {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: BUSINESS_ID, ...rules }),
      })
    } else {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: BUSINESS_ID, ...notif }),
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  const tabs = ['booking', 'notifications']

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}>
            {tab === 'booking' ? 'Booking Rules' : 'Notifications'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 max-w-lg">

        {activeTab === 'booking' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Rules</h2>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Minimum notice (hours before booking)</p>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                value={rules.min_notice_hours}
                onChange={e => setRules({ ...rules, min_notice_hours: Number(e.target.value) })} />
              <p className="text-xs text-gray-400 mt-1">Clients cannot book less than X hours in advance</p>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Maximum advance booking (days)</p>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                value={rules.max_advance_days}
                onChange={e => setRules({ ...rules, max_advance_days: Number(e.target.value) })} />
              <p className="text-xs text-gray-400 mt-1">Clients cannot book more than X days ahead</p>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Max daily bookings per staff</p>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                value={rules.max_daily_bookings}
                onChange={e => setRules({ ...rules, max_daily_bookings: Number(e.target.value) })} />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Slot interval (minutes)</p>
              <select className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                value={rules.slot_interval_minutes}
                onChange={e => setRules({ ...rules, slot_interval_minutes: Number(e.target.value) })}>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 60 minutes</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Client Emails</h3>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Confirmation email</p>
                  <p className="text-xs text-gray-500">Sent immediately after booking</p>
                </div>
                <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                  checked={notif.confirmation_email_enabled}
                  onChange={e => setNotif({ ...notif, confirmation_email_enabled: e.target.checked })} />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Reminder email</p>
                    <p className="text-xs text-gray-500">Sent before appointment</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                    checked={notif.reminder_email_enabled}
                    onChange={e => setNotif({ ...notif, reminder_email_enabled: e.target.checked })} />
                </div>
                {notif.reminder_email_enabled && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-600">Send</p>
                    <input type="number" min={1} max={72}
                      className="w-16 border rounded px-2 py-1 text-sm text-gray-900"
                      value={notif.reminder_hours_before}
                      onChange={e => setNotif({ ...notif, reminder_hours_before: Number(e.target.value) })} />
                    <p className="text-xs text-gray-600">hours before appointment</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Review request email</p>
                    <p className="text-xs text-gray-500">Sent after appointment</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                    checked={notif.review_email_enabled}
                    onChange={e => setNotif({ ...notif, review_email_enabled: e.target.checked })} />
                </div>
                {notif.review_email_enabled && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-600">Send</p>
                    <input type="number" min={1} max={48}
                      className="w-16 border rounded px-2 py-1 text-sm text-gray-900"
                      value={notif.review_hours_after}
                      onChange={e => setNotif({ ...notif, review_hours_after: Number(e.target.value) })} />
                    <p className="text-xs text-gray-600">hours after appointment</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Owner Notifications</h3>

              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email notifications</p>
                    <p className="text-xs text-gray-500">Get notified by email on new bookings</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                    checked={notif.owner_email_enabled}
                    onChange={e => setNotif({ ...notif, owner_email_enabled: e.target.checked })} />
                </div>
                {notif.owner_email_enabled && (
                  <input type="email"
                    className="w-full border rounded px-3 py-1.5 text-sm text-gray-900 mt-1"
                    placeholder="owner@salon.sk"
                    value={notif.owner_email}
                    onChange={e => setNotif({ ...notif, owner_email: e.target.value })} />
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Telegram notifications</p>
                    <p className="text-xs text-gray-500">Get instant Telegram messages</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                    checked={notif.owner_telegram_enabled}
                    onChange={e => setNotif({ ...notif, owner_telegram_enabled: e.target.checked })} />
                </div>
                {notif.owner_telegram_enabled && (
                  <input type="text"
                    className="w-full border rounded px-3 py-1.5 text-sm text-gray-900 mt-1"
                    placeholder="Telegram Chat ID e.g. 123456789"
                    value={notif.owner_telegram_chat_id}
                    onChange={e => setNotif({ ...notif, owner_telegram_chat_id: e.target.value })} />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Save Settings
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">Saved successfully!</span>
          )}
        </div>
      </form>
    </div>
  )
}
