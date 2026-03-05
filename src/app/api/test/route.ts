import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/google-calendar'

export async function GET() {
  try {
    // Replace with your actual Google Calendar ID from service account
    const testCalendarId = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!

    const slots = await getAvailableSlots(
      testCalendarId,
      '2026-03-10',        // test date
      'Europe/Bratislava',
      '09:00',
      '17:00',
      60,                  // 60min service
      10,                  // 10min cleanup
      15                   // every 15min
    )

    return NextResponse.json({
      success: true,
      slots_count: slots.length,
      first_slot: slots[0],
      last_slot: slots[slots.length - 1],
    })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message 
    }, { status: 500 })
  }
}
