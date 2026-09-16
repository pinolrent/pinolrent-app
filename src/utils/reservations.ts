import { daysBetween } from './dates'

export function reservationTotal(
  startDate: string,
  endDate: string,
  pricePerDay: number
): { days: number; total: number } {
  const days = daysBetween(startDate, endDate)
  return { days, total: days * pricePerDay }
}
