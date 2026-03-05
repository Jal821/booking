import { NextRequest, NextResponse } from 'next/server'
import { sendReminderEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { booking } = await req.json()
    await sendReminderEmail(booking)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}