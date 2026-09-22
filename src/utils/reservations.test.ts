import { describe, expect, it } from 'vitest'
import {
  MAX_RESERVATION_NIGHTS,
  isValidReservationRange,
  reservationRangeError,
  reservationTotal,
} from './reservations'

describe('reservationTotal', () => {
  it('multiplies the days by the daily price', () => {
    expect(reservationTotal('2026-09-15', '2026-09-18', 4500)).toEqual({
      days: 3,
      total: 13500,
    })
  })

  it('returns a single day for consecutive dates', () => {
    expect(reservationTotal('2026-09-15', '2026-09-16', 4500)).toEqual({
      days: 1,
      total: 4500,
    })
  })

  it('is zero when both dates match', () => {
    expect(reservationTotal('2026-09-15', '2026-09-15', 4500)).toEqual({
      days: 0,
      total: 0,
    })
  })
})

describe('reservationRangeError', () => {
  const today = '2026-09-22'

  it('is null for a valid range', () => {
    expect(reservationRangeError('2026-09-27', '2026-09-30', today)).toBeNull()
  })

  it('rejects a start date in the past', () => {
    expect(reservationRangeError('2026-09-20', '2026-09-25', today)).toBe(
      'La fecha de inicio no puede ser anterior a hoy'
    )
  })

  it('rejects ranges of zero or negative length', () => {
    expect(reservationRangeError('2026-09-27', '2026-09-27', today)).toBe(
      'La reserva debe durar al menos 1 día'
    )
    expect(reservationRangeError('2026-09-27', '2026-09-26', today)).toBe(
      'La reserva debe durar al menos 1 día'
    )
  })

  it('allows the largest bookable range (30 days inclusive)', () => {
    expect(reservationRangeError('2026-10-01', '2026-10-30', today)).toBeNull()
  })

  it('rejects ranges past the 30 day cap', () => {
    expect(reservationRangeError('2026-10-01', '2026-10-31', today)).toBe(
      'La reserva no puede superar los 30 días'
    )
  })

  it('is null while a date is missing or invalid', () => {
    expect(reservationRangeError('', '2026-10-01', today)).toBeNull()
    expect(reservationRangeError('2026-10-01', 'nope', today)).toBeNull()
  })

  it('exposes the nights cap the calendar blocks', () => {
    expect(MAX_RESERVATION_NIGHTS).toBe(29)
    expect(
      reservationRangeError('2026-10-01', '2026-10-31', today, 40)
    ).toBeNull()
  })
})

describe('isValidReservationRange', () => {
  const today = '2026-09-22'

  it('accepts a bookable range', () => {
    expect(
      isValidReservationRange('2026-09-27', '2026-09-30', today)
    ).toBe(true)
  })

  it('rejects incomplete, past or oversized ranges', () => {
    expect(isValidReservationRange('2026-09-27', '', today)).toBe(false)
    expect(isValidReservationRange('2026-09-20', '2026-09-30', today)).toBe(
      false
    )
    expect(isValidReservationRange('2026-10-01', '2026-10-31', today)).toBe(
      false
    )
  })
})
