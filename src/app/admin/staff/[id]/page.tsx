'use client'
import { use, useEffect, useState } from 'react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const BUSINESS_ID = 'c0e500b6-de3b-4c5b-a2de-0832b85b9934'

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tab, setTab] = useState('info')
  const [saved, setSaved] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [hours, setHours] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [globalBreak, setGlobalBreak] = useState({ start: '', end: '' })
  const [newBlock, setNewBlock] = useState({ date: '', starts_at: '', ends_at: '', reason: '', whole_day: false })

  useEffect(() => {
    fetch(`/api/staff?business_id=${BUSINESS_ID}`).then(r => r.json()).then(d => {
      const m = d.staff?.find((s: any) => s.id === id)
      setMember(m)
    })
    fetch(`/api/services?business_id=${BUSINESS_ID}`).then(r => r.json()).then(d => setServices(d.services || []))
    fetch(`/api/staff/${id}/hours`).then(r => r.json()).then(d => {
      const h = d.hours || []
      setHours(h)
      // Pick break from first working day
      const firstWorking = h.find((x: any) => x.is_working && x.break_start)
      if (firstWorking) setGlobalBreak({ start: firstWorking.break_start, end: firstWorking.break_end })
    })
    fetch(`/api/staff/${id}/blocks`).then(r => r.json()).then(d => setBlocks(d.blocks || []))
  }, [id])

  const saveInfo = async () => {
    await fetch('/api/staff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...member }),
    })
    showSaved()
  }

  const saveHours = async () => {
    // Apply global break to all working days
    const updated = hours.map(h => ({
      ...h,
      break_start: h.is_working && globalBreak.start ? globalBreak.start : null,
      break_end: h.is_working && globalBreak.end ? globalBreak.end : null,
    }))
    setHours(updated)
    await fetch(`/api/staff/${id}/hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours: updated }),
    })
    showSaved()
  }

  const addBlock = async () => {
    if (!newBlock.date) return
    const starts_at = newBlock.whole_day
      ? `${newBlock.date}T00:00:00`
      : `${newBlock.date}T${newBlock.starts_at || '00:00'}:00`
    const ends_at = newBlock.whole_day
      ? `${newBlock.date}T23:59:59`
      : `${newBlock.date}T${newBlock.ends_at || '23:59'}:00`

    const res = await fetch(`/api/staff/${id}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starts_at, ends_at, reason: newBlock.reason }),
    })
    const data = await res.json()
    setBlocks([...blocks, data.block])
    setNewBlock({ date: '', starts_at: '', ends_at: '', reason: '', whole_day: false })
  }

  const deleteBlock = async (blockId: string) => {
    await fetch(`/api/staff/${id}/blocks?block_id=${blockId}`, { method: 'DELETE' })
    setBlocks(blocks.filter(b => b.id !== blockId))
  }

  const toggleService = (serviceId: string) => {
    const current = member.service_ids ?? []
    const updated = current.includes(serviceId)
      ? current.filter((s: string) => s !== serviceId)
      : [...current, serviceId]
    setMember({ ...member, service_ids: updated })
  }

  const updateHour = (i: number, field: string, value: any) => {
    const updated = [...hours]
    updated[i] = { ...updated[i], [field]: value }
    setHours(updated)
  }

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 3000) }

  if (!member) return <div className="p-8 text-gray-500">Loading...</div>

  const tabs = ['info', 'schedule', 'services', 'blocks']

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/staff" className="text-gray-400 hover:text-gray-600 text-sm">← Back to Staff</a>
        <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}>
            {t === 'blocks' ? '🚫 Block Time' : t === 'schedule' ? '🗓 Schedule' : t === 'services' ? '💅 Services' : '👤 Info'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">

        {tab === 'info' && (
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Google Calendar ID', key: 'google_calendar_id', placeholder: 'xxx@group.calendar.google.com' },
              { label: 'Telegram Chat ID', key: 'telegram_chat_id', placeholder: '123456789' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type ?? 'text'}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={member[key] ?? ''} placeholder={placeholder}
                  onChange={e => setMember({ ...member, [key]: e.target.value })} />
              </div>
            ))}
            <button onClick={saveInfo}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              {saved ? '✅ Saved!' : 'Save Info'}
            </button>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Set working hours per day. Break applies to all working days.</p>

            {/* Global break */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm font-semibold text-amber-800 mb-3">☕ Daily Break (applies to all working days)</p>
              <div className="flex items-center gap-3">
                <input type="time" value={globalBreak.start}
                  className="border rounded px-2 py-1 text-sm text-gray-900"
                  onChange={e => setGlobalBreak({ ...globalBreak, start: e.target.value })} />
                <span className="text-gray-400 text-sm">to</span>
                <input type="time" value={globalBreak.end}
                  className="border rounded px-2 py-1 text-sm text-gray-900"
                  onChange={e => setGlobalBreak({ ...globalBreak, end: e.target.value })} />
                <button onClick={() => setGlobalBreak({ start: '', end: '' })}
                  className="text-xs text-gray-400 hover:text-red-500">Clear</button>
              </div>
            </div>

            {/* Per day hours */}
            {hours.map((h, i) => (
              <div key={h.day_of_week} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-28">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                      checked={h.is_working}
                      onChange={e => updateHour(i, 'is_working', e.target.checked)} />
                    <span className="text-sm font-medium text-gray-700">{DAYS[h.day_of_week]}</span>
                  </label>
                </div>
                {h.is_working ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={h.start_time ?? '09:00'}
                      className="border rounded px-2 py-1 text-sm text-gray-900"
                      onChange={e => updateHour(i, 'start_time', e.target.value)} />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={h.end_time ?? '17:00'}
                      className="border rounded px-2 py-1 text-sm text-gray-900"
                      onChange={e => updateHour(i, 'end_time', e.target.value)} />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Day off</span>
                )}
              </div>
            ))}
            <button onClick={saveHours}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              {saved ? '✅ Saved!' : 'Save Schedule'}
            </button>
          </div>
        )}

        {tab === 'services' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Select which services this staff member performs.</p>
            {services.map(service => (
              <label key={service.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="checkbox" className="w-4 h-4 accent-indigo-600"
                  checked={(member.service_ids ?? []).includes(service.id)}
                  onChange={() => toggleService(service.id)} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{service.name}</p>
                  <p className="text-xs text-gray-500">{service.duration_minutes} min · {service.price} {service.currency}</p>
                </div>
              </label>
            ))}
            <button onClick={saveInfo}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 mt-4">
              {saved ? '✅ Saved!' : 'Save Services'}
            </button>
          </div>
        )}

        {tab === 'blocks' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Time Block</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    value={newBlock.date}
                    onChange={e => setNewBlock({ ...newBlock, date: e.target.value })} />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-red-600"
                    checked={newBlock.whole_day}
                    onChange={e => setNewBlock({ ...newBlock, whole_day: e.target.checked })} />
                  <span className="text-sm text-gray-700">Block entire day</span>
                </label>

                {!newBlock.whole_day && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">From time</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                        value={newBlock.starts_at}
                        onChange={e => setNewBlock({ ...newBlock, starts_at: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To time</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                        value={newBlock.ends_at}
                        onChange={e => setNewBlock({ ...newBlock, ends_at: e.target.value })} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason (optional)</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    placeholder="Holiday, sick leave, training..."
                    value={newBlock.reason}
                    onChange={e => setNewBlock({ ...newBlock, reason: e.target.value })} />
                </div>

                <button onClick={addBlock} disabled={!newBlock.date}
                  className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  🚫 {newBlock.whole_day ? 'Block Entire Day' : 'Block Time Slot'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Blocks</h3>
              {blocks.length === 0 ? (
                <p className="text-sm text-gray-400">No time blocks set.</p>
              ) : (
                <div className="space-y-2">
                  {blocks.map(block => (
                    <div key={block.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(block.starts_at).toLocaleString('sk-SK', { dateStyle: 'short', timeStyle: 'short' })} –{' '}
                          {new Date(block.ends_at).toLocaleString('sk-SK', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                        {block.reason && <p className="text-xs text-gray-500">{block.reason}</p>}
                      </div>
                      <button onClick={() => deleteBlock(block.id)}
                        className="text-red-500 text-sm hover:text-red-700">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}