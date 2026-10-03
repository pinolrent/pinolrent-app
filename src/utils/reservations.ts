import { daysBetween, isValidISODate } from './dates'

// The API rejects reservations where end - start is 30 days or more, so the
// largest bookable range is 29 days of difference (30 days inclusive).
export const MAX_RESERVATION_NIGHTS = 29

// Platform rates: renters pay a service fee on top of the subtotal, sellers
// get a deduction taken off it. Both apply to days * pricePerDay.
export const SERVICE_FEE_PERCENT = 7
export const SELLER_FEE_PERCENT = 7

export interface ReservationPricing {
  days: number
  subtotal: number
  serviceFee: number
  buyerTotal: number
  sellerFee: number
  sellerNet: number
}

export function reservationPricing(
  startDate: string,
  endDate: string,
  pricePerDay: number
): ReservationPricing {
  const days = daysBetween(startDate, endDate)
  const subtotal = days * pricePerDay
  const serviceFee = Math.round((subtotal * SERVICE_FEE_PERCENT) / 100)
  const sellerFee = Math.round((subtotal * SELLER_FEE_PERCENT) / 100)
  return {
    days,
    subtotal,
    serviceFee,
    buyerTotal: subtotal + serviceFee,
    sellerFee,
    sellerNet: subtotal - sellerFee,
  }
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
