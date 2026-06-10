// Sprint 1 fix: a bus's seat sale closes 2 hours before its scheduled
// departure. Today's departures that are < 2 hours away should be hidden
// from search results AND blocked at the final confirm step (race-condition
// guard for someone who held the page open past the cutoff).
//
// Date is "YYYY-MM-DD" (Asia/Kathmandu). Time is "HH:MM" 24h.
// All comparisons happen in Asia/Kathmandu so a Vercel server in Iowa
// can't accidentally close a 10pm Pokhara bus at 7pm local.

export const BOOKING_CUTOFF_MS = 2 * 60 * 60 * 1000 // 2 hours

const TIME_ZONE = "Asia/Kathmandu"

/** Get current wall-clock time in Asia/Kathmandu as { date: "YYYY-MM-DD",
 *  minutesSinceMidnight: number }. We avoid `Date.parse(... + "Asia/Kathmandu")`
 *  because that's not portable; instead we read each part out via Intl. */
function nowInKathmandu(): { date: string; minutesSinceMidnight: number } {
  const now = new Date()
  // en-CA gives "YYYY-MM-DD"
  const date = now.toLocaleDateString("en-CA", { timeZone: TIME_ZONE })
  // 24h time "HH:MM"
  const time = now.toLocaleTimeString("en-GB", {
    timeZone: TIME_ZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })
  const [hh, mm] = time.split(":").map(Number)
  return { date, minutesSinceMidnight: hh * 60 + mm }
}

function parseHhMm(t: string): number {
  const [hh, mm] = (t || "00:00").split(":").map(Number)
  return (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0)
}

/** True if the given departure (date + time) is bookable right now under the
 *  2-hour cutoff rule. Future dates are always bookable. Past dates are
 *  always closed. Today is bookable only if `now + 2h < departure`. */
export function isBookable(
  departureDate: string,
  departureTime: string,
  nowProvider: () => { date: string; minutesSinceMidnight: number } = nowInKathmandu
): boolean {
  if (!departureDate || !departureTime) return true // permissive fallback for malformed data

  const now = nowProvider()

  if (departureDate > now.date) return true   // future date
  if (departureDate < now.date) return false  // past date

  // Same day — check the 2-hour window.
  const departureMin = parseHhMm(departureTime)
  const cutoffMin = now.minutesSinceMidnight + 120
  return departureMin > cutoffMin
}

/** UX copy explaining WHY a bus isn't bookable. Used by the review-pay guard
 *  and search empty states. */
export function cutoffReason(departureDate: string, departureTime: string): string {
  const now = nowInKathmandu()
  if (departureDate < now.date) {
    return "This bus has already departed."
  }
  if (departureDate === now.date) {
    return `Booking closes 2 hours before departure. This bus leaves at ${departureTime}, which is too soon to book now.`
  }
  return ""
}
