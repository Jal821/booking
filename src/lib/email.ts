import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail({
  clientName,
  clientEmail,
  serviceName,
  staffName,
  startsAt,
  endsAt,
  businessName,
  bookingId,
}: {
  clientName: string
  clientEmail: string
  serviceName: string
  staffName: string
  startsAt: string
  endsAt: string
  businessName: string
  bookingId: string
}) {
  const date = new Date(startsAt).toLocaleDateString('sk-SK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const timeStart = new Date(startsAt).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
  const timeEnd = new Date(endsAt).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })

  return resend.emails.send({
    from: 'Booking <onboarding@resend.dev>',
    to: clientEmail,
    subject: `Booking confirmed – ${serviceName} at ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5;">Booking Confirmed!</h2>
        <p>Hi ${clientName},</p>
        <p>Your appointment has been confirmed. Here are your details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${serviceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Staff</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${staffName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${date}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${timeStart} - ${timeEnd}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID</td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 12px; color: #9ca3af;">${bookingId}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 14px;">See you soon!</p>
        <p style="color: #6b7280; font-size: 14px;">${businessName}</p>
      </div>
    `,
  })
}

export async function sendReminderEmail({
  clientName,
  clientEmail,
  serviceName,
  staffName,
  startsAt,
  businessName,
}: {
  clientName: string
  clientEmail: string
  serviceName: string
  staffName: string
  startsAt: string
  businessName: string
}) {
  const date = new Date(startsAt).toLocaleDateString('sk-SK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const time = new Date(startsAt).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })

  return resend.emails.send({
    from: 'Booking <onboarding@resend.dev>',
    to: clientEmail,
    subject: `Reminder: ${serviceName} tomorrow at ${time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5;">Appointment Reminder</h2>
        <p>Hi ${clientName},</p>
        <p>This is a reminder about your upcoming appointment:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${serviceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Staff</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${staffName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${time}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 14px;">See you soon!</p>
        <p style="color: #6b7280; font-size: 14px;">${businessName}</p>
      </div>
    `,
  })
}

export async function sendReviewEmail({
  clientName,
  clientEmail,
  serviceName,
  businessName,
  bookingId,
}: {
  clientName: string
  clientEmail: string
  serviceName: string
  businessName: string
  bookingId: string
}) {
  return resend.emails.send({
    from: 'Booking <onboarding@resend.dev>',
    to: clientEmail,
    subject: `How was your ${serviceName} at ${businessName}?`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5;">How was your experience?</h2>
        <p>Hi ${clientName},</p>
        <p>We hope you enjoyed your <strong>${serviceName}</strong> at ${businessName}!</p>
        <p>We would love to hear your feedback. Please take a moment to leave a review:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/review/${bookingId}"
            style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Leave a Review
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Thank you for choosing ${businessName}!</p>
      </div>
    `,
  })
}

export async function sendOwnerNotificationEmail({
  ownerEmail,
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  staffName,
  startsAt,
  businessName,
}: {
  ownerEmail: string
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceName: string
  staffName: string
  startsAt: string
  businessName: string
}) {
  const date = new Date(startsAt).toLocaleDateString('sk-SK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const time = new Date(startsAt).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })

  return resend.emails.send({
    from: 'Booking <onboarding@resend.dev>',
    to: ownerEmail,
    subject: `New booking: ${clientName} – ${serviceName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5;">New Booking Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Client</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${clientName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; font-size: 14px;">${clientEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone</td>
            <td style="padding: 8px 0; font-size: 14px;">${clientPhone || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${serviceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Staff</td>
            <td style="padding: 8px 0; font-size: 14px;">${staffName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${time}</td>
          </tr>
        </table>
      </div>
    `,
  })
}
