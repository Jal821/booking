import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

function getGoogleCalendarUrl(booking: any) {
  const start = new Date(booking.starts_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const end = new Date(booking.ends_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const title = encodeURIComponent(booking.services?.name ?? 'Appointment')
  const details = encodeURIComponent(`Staff: ${booking.staff?.name ?? 'N/A'}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`
}

export async function sendConfirmationEmail(booking: any) {
  const appointmentTime = new Date(booking.starts_at).toLocaleString('sk-SK', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  })

  const googleCalUrl = getGoogleCalendarUrl(booking)
  const appleCalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/ics/${booking.id}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: booking.client_email,
    subject: `Booking confirmed ✅`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Your booking is confirmed! ✅</h2>
        <p>Hi <strong>${booking.client_name}</strong>,</p>
        <p>Your appointment has been successfully booked. Here are your details:</p>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Service</strong></td><td style="padding:8px;">${booking.services?.name ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Staff</strong></td><td style="padding:8px;">${booking.staff?.name ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Date & Time</strong></td><td style="padding:8px;">${appointmentTime}</td></tr>
        </table>

        <p style="margin-bottom: 8px;"><strong>Add to your calendar:</strong></p>
        <div style="display:flex; gap:12px; margin-bottom: 24px;">
          <a href="${googleCalUrl}" target="_blank"
            style="display:inline-block; padding:10px 20px; background:#4285F4; color:white; border-radius:8px; text-decoration:none; font-size:14px; font-weight:bold;">
            📅 Google Calendar
          </a>
          <a href="${appleCalUrl}"
            style="display:inline-block; padding:10px 20px; background:#333333; color:white; border-radius:8px; text-decoration:none; font-size:14px; font-weight:bold; margin-left:8px;">
            🍎 Apple Calendar
          </a>
        </div>

        <p style="color:#6b7280; font-size:14px;">If you need to cancel or reschedule, please contact us as soon as possible.</p>
        <p style="color:#6b7280; font-size:14px;">Thank you for your booking!</p>
      </div>
    `,
  })
}

export async function sendReminderEmail(booking: any) {
  const appointmentTime = new Date(booking.starts_at).toLocaleString('sk-SK', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  })

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: booking.client_email,
    subject: `Reminder: Your appointment`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Appointment Reminder 🗓️</h2>
        <p>Hi <strong>${booking.client_name}</strong>,</p>
        <p>Just a reminder about your upcoming appointment:</p>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Service</strong></td><td style="padding:8px;">${booking.services?.name ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Staff</strong></td><td style="padding:8px;">${booking.staff?.name ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Date & Time</strong></td><td style="padding:8px;">${appointmentTime}</td></tr>
        </table>
        <p style="color:#6b7280; font-size:14px;">If you need to cancel, please contact us as soon as possible.</p>
      </div>
    `,
  })
}

export async function sendReviewEmail(booking: any) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: booking.client_email,
    subject: `How was your appointment? ⭐`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Thank you for visiting us! 💜</h2>
        <p>Hi <strong>${booking.client_name}</strong>,</p>
        <p>We hope you enjoyed your <strong>${booking.services?.name ?? 'appointment'}</strong>!</p>
        <p>We would love to hear your feedback — it only takes 1 minute:</p>
        <a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK" style="display:inline-block; margin:16px 0; padding:12px 24px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          Leave a Review ⭐
        </a>
        <p style="color:#6b7280; font-size:14px;">Thank you for your support!</p>
      </div>
    `,
  })
}

export async function sendOwnerNotification(booking: any, ownerEmail: string) {
  const appointmentTime = new Date(booking.starts_at).toLocaleString('sk-SK', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  })

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ownerEmail,
    subject: `New booking: ${booking.client_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">New Booking 🎉</h2>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Client</strong></td><td style="padding:8px;">${booking.client_name}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Email</strong></td><td style="padding:8px;">${booking.client_email}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Phone</strong></td><td style="padding:8px;">${booking.client_phone ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Service</strong></td><td style="padding:8px;">${booking.services?.name ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Staff</strong></td><td style="padding:8px;">${booking.staff?.name ?? 'N/A'}</td></tr>
          <tr><td style="padding:8px; background:#f3f4f6;"><strong>Date & Time</strong></td><td style="padding:8px;">${appointmentTime}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function sendTelegramNotification(chatId: string, booking: any) {
  const appointmentTime = new Date(booking.starts_at).toLocaleString('sk-SK', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  })

  const message = `🎉 New Booking!\n\n👤 ${booking.client_name}\n📧 ${booking.client_email}\n📱 ${booking.client_phone ?? 'N/A'}\n💅 ${booking.services?.name ?? 'N/A'}\n👩 ${booking.staff?.name ?? 'N/A'}\n🗓️ ${appointmentTime}`

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  })
}