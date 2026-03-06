import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots } from "@/lib/google-calendar"
import { addMinutes } from "date-fns"
import { format } from "date-fns"

const DOW_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

type Slot = { start: string; end: string; available: boolean }

function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart
}

function generateSlotsFromWindow(
  start: Date,
  end: Date,
  durationMinutes: number,
  cleanupMinutes: number,
  slotInterval: number
): Slot[] {
  const total = durationMinutes + (cleanupMinutes || 0)
  const slots: Slot[] = []
  let current = new Date(start)

  while (addMinutes(current, total) <= end) {
    const slotEnd = addMinutes(current, total)
    slots.push({
      start: current.toISOString(),
      end: slotEnd.toISOString(),
      available: true,
    })
    current = addMinutes(current, slotInterval)
  }

  return slots
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business_id = searchParams.get("business_id")
    const service_id = searchParams.get("service_id")
    const staff_id = searchParams.get("staff_id")
    const date = searchParams.get("date") // YYYY-MM-DD

    if (!business_id || !service_id || !date) {
      return NextResponse.json(
        { error: "business_id, service_id and date are required" },
        { status: 400 }
      )
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("timezone")
      .eq("id", business_id)
      .single()
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes, cleanup_minutes")
      .eq("id", service_id)
      .single()
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const { data: rules } = await supabase
      .from("booking_rules")
      .select("slot_interval_minutes")
      .eq("business_id", business_id)
      .single()
    const slotInterval = rules?.slot_interval_minutes || 15

    const staffQuery = supabase
      .from("staff")
      .select("id, name, google_calendar_id, working_hours")
      .eq("business_id", business_id)
    if (staff_id) staffQuery.eq("id", staff_id)
    const { data: staffList } = await staffQuery
    if (!staffList || staffList.length === 0) {
      return NextResponse.json({ error: "No staff found" }, { status: 404 })
    }

    const dow = new Date(date + "T12:00:00").getDay()
    const dayKey = DOW_KEY[dow]
    const dayStartIso = `${date}T00:00:00+00:00`
    const dayEndIso = `${date}T23:59:59+00:00`

    // breaks from staff_working_hours
    const { data: workingHoursRows } = await supabase
      .from("staff_working_hours")
      .select("staff_id, day_of_week, start_time, end_time, is_working, break_start, break_end")
      .in("staff_id", staffList.map((s) => s.id))
      .eq("day_of_week", dow)

    const breakMap: Record<
      string,
      { break_start: string | null; break_end: string | null; start_time: string; end_time: string; is_working: boolean }
    > = {}
    for (const row of workingHoursRows ?? []) {
      breakMap[row.staff_id] = {
        break_start: row.break_start,
        break_end: row.break_end,
        start_time: row.start_time,
        end_time: row.end_time,
        is_working: row.is_working,
      }
    }

    // time blocks
    const { data: blocks } = await supabase
      .from("staff_time_blocks")
      .select("staff_id, starts_at, ends_at")
      .in("staff_id", staffList.map((s) => s.id))
      .lte("starts_at", `${date}T23:59:59`)
      .gte("ends_at", `${date}T00:00:00`)

    const blocksMap: Record<string, { starts_at: string; ends_at: string }[]> = {}
    for (const b of blocks ?? []) {
      if (!blocksMap[b.staff_id]) blocksMap[b.staff_id] = []
      blocksMap[b.staff_id].push(b)
    }

    // existing bookings for that day and service
    const { data: bookings } = await supabase
      .from("bookings")
      .select("staff_id, starts_at, ends_at, status, service_id")
      .eq("business_id", business_id)
      .eq("service_id", service_id)
      .in("status", ["confirmed", "pending"])
      .lte("starts_at", `${date}T23:59:59`)
      .gte("ends_at", `${date}T00:00:00`)

    const bookingsMap: Record<string, { starts_at: string; ends_at: string }[]> = {}
    for (const b of bookings ?? []) {
      if (!bookingsMap[b.staff_id]) bookingsMap[b.staff_id] = []
      bookingsMap[b.staff_id].push(b)
    }

    const results = await Promise.all(
      staffList.map(async (member) => {
        const whJson = member.working_hours?.[dayKey]
        const whRow = breakMap[member.id]

        const isWorking =
          whRow?.is_working ??
          (whJson?.active ?? false)

        if (!isWorking) return null

        const startStr = whRow?.start_time ?? whJson?.start
        const endStr = whRow?.end_time ?? whJson?.end
        if (!startStr || !endStr) return null

        const [sh, sm] = startStr.split(":").map(Number)
        const [eh, em] = endStr.split(":").map(Number)

        const workStart = new Date(date + "T00:00:00")
        workStart.setHours(sh, sm, 0, 0)
        const workEnd = new Date(date + "T00:00:00")
        workEnd.setHours(eh, em, 0, 0)

        const memberBlocks = blocksMap[member.id] ?? []
        const fullDayBlock = memberBlocks.find(
          (b) => b.starts_at <= dayStartIso && b.ends_at >= dayEndIso
        )
        if (fullDayBlock) return null

        let slots: Slot[] = []

        if (member.google_calendar_id) {
          slots = await getAvailableSlots(
            member.google_calendar_id,
            date,
            business.timezone,
            startStr,
            endStr,
            service.duration_minutes,
            service.cleanup_minutes,
            slotInterval
          )
        } else {
          slots = generateSlotsFromWindow(
            workStart,
            workEnd,
            service.duration_minutes,
            service.cleanup_minutes,
            slotInterval
          )
        }

        // apply breaks
        const brk = whRow
        if (brk?.break_start && brk?.break_end) {
          const bStart = brk.break_start.slice(0, 5)
          const bEnd = brk.break_end.slice(0, 5)
          slots = slots.map((slot) => {
            const t = format(new Date(slot.start), "HH:mm")
            const inBreak = t >= bStart && t < bEnd
            return inBreak ? { ...slot, available: false } : slot
          })
        }

        // apply time blocks
        const partialBlocks = memberBlocks.filter(
          (b) => !(b.starts_at <= dayStartIso && b.ends_at >= dayEndIso)
        )
        if (partialBlocks.length > 0) {
          slots = slots.map((slot) => {
            const s = new Date(slot.start)
            const e = new Date(slot.end)
            const blocked = partialBlocks.some((b) =>
              intervalsOverlap(
                s,
                e,
                new Date(b.starts_at),
                new Date(b.ends_at)
              )
            )
            return blocked ? { ...slot, available: false } : slot
          })
        }

        // apply bookings
        const memberBookings = bookingsMap[member.id] ?? []
        if (memberBookings.length > 0) {
          slots = slots.map((slot) => {
            const s = new Date(slot.start)
            const e = new Date(slot.end)
            const overlapsBooking = memberBookings.some((b) =>
              intervalsOverlap(
                s,
                e,
                new Date(b.starts_at),
                new Date(b.ends_at)
              )
            )
            return overlapsBooking ? { ...slot, available: false } : slot
          })
        }

        return { staff_id: member.id, staff_name: member.name, slots }
      })
    )

    return NextResponse.json({
      date,
      service_id,
      staff_slots: results.filter(Boolean),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}