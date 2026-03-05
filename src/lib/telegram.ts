export async function sendTelegramMessage({
  chatId,
  message,
}: {
  chatId: string
  message: string
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not set')
    return
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })

  if (!res.ok) {
    console.warn('Telegram send failed:', await res.text())
  }

  return res.json()
}
