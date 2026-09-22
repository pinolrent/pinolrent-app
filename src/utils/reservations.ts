import { daysBetween, isValidISODate } from './dates'

// The API rejects reservations where end - start is 30 days or more, so the
// largest bookable range is 29 days of difference (30 days inclusive).
export const MAX_RESERVATION_NIGHTS = 29

export function reservationTotal(
  startDate: string,
  endDate: string,
  pricePerDay: number
): { days: number; total: number } {
  const days = daysBetween(startDate, endDate)
  return { days, total: days * pricePerDay }
}

export function reservationRangeError(
  startDate: string,
  endDate: string,
  today: string,
  maxNights: number = MAX_RESERVATION_NIGHTS
): string | null {
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) return null
  if (startDate < today) return 'La fecha de inicio no puede ser anterior a hoy'
  if (endDate <= startDate) return 'La reserva debe durar al menos 1 día'
  if (daysBetween(startDate, endDate) > maxNights)
    return 'La reserva no puede superar los 30 días'
  return null
}

export function isValidReservationRange(
  startDate: string,
  endDate: string,
  today: string,
  maxNights: number = MAX_RESERVATION_NIGHTS
): boolean {
  return (
    isValidISODate(startDate) &&
    isValidISODate(endDate) &&
    reservationRangeError(startDate, endDate, today, maxNights) === null
  )
}
