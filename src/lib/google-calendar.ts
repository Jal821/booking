import { google } from 'googleapis'
import { addMinutes, formatISO } from 'date-fns'

const getCalendarClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return google.calendar({ version: 'v3', auth })
}

// Get busy slots from Google Calendar for a given day
export async function getBusySlots(
  calendarId: string,
  date: string, // YYYY-MM-DD
  timezone: string
) {
  const calendar = getCalendarClient()
  const timeMin = new Date(`${date}T00:00:00`)
  const timeMax = new Date(`${date}T23:59:59`)

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: timezone,
      items: [{ id: calendarId }],
    },
  })

  return res.data.calendars?.[calendarId]?.busy || []
}

// Generate available slots for a day
export async function getAvailableSlots(
  calendarId: string,
  date: string,           // YYYY-MM-DD
  timezone: string,
  workingStart: string,   // "09:00"
  workingEnd: string,     // "17:00"
  durationMinutes: number,
  cleanupMinutes: number,
  slotIntervalMinutes: number = 15
) {
  const busySlots = await getBusySlots(calendarId, date, timezone)

  const slots = []
  const totalMinutes = durationMinutes + cleanupMinutes

  const [startHour, startMin] = workingStart.split(':').map(Number)
  const [endHour, endMin] = workingEnd.split(':').map(Number)

  const dayStart = new Date(`${date}T${workingStart}:00`)
  const dayEnd = new Date(`${date}T${workingEnd}:00`)

  let current = dayStart

  while (current < dayEnd) {
    const slotEnd = addMinutes(current, totalMinutes)

    if (slotEnd > dayEnd) break

    // Check if slot overlaps with any busy period
    const isbusy = busySlots.some((busy: any) => {
      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)
      return current < busyEnd && slotEnd > busyStart
    })

    slots.push({
      start: formatISO(current),
      end: formatISO(addMinutes(current, durationMinutes)),
      available: !isbusy,
    })

    current = addMinutes(current, slotIntervalMinutes)
  }

  return slots
}

// Create a booking event in Google Calendar
export async function createCalendarEvent(
  calendarId: string,
  summary: string,
  description: string,
  startTime: string,  // ISO
  endTime: string,    // ISO
  clientEmail: string,
  timezone: string
) {
  const calendar = getCalendarClient()

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: { dateTime: startTime, timeZone: timezone },
      end: { dateTime: endTime, timeZone: timezone },
      attendees: [{ email: clientEmail }],
      reminders: { useDefault: true },
    },
  })

  return res.data
}

// Delete a booking event from Google Calendar
export async function deleteCalendarEvent(
  calendarId: string,
  eventId: string
) {
  const calendar = getCalendarClient()
  await calendar.events.delete({ calendarId, eventId })
}
