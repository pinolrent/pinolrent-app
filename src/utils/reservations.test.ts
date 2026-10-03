import { describe, expect, it } from 'vitest'
import {
  MAX_RESERVATION_NIGHTS,
  isValidReservationRange,
  reservationPricing,
  reservationRangeError,
} from './reservations'

describe('reservationPricing', () => {
  it('applies the service fee and the seller deduction to the subtotal', () => {
    expect(reservationPricing('2026-09-15', '2026-09-18', 4500)).toEqual({
      days: 3,
      subtotal: 13500,
      serviceFee: 945,
      buyerTotal: 14445,
      sellerFee: 945,
      sellerNet: 12555,
    })
  })

  it('handles a single day', () => {
    expect(reservationPricing('2026-09-15', '2026-09-16', 4500)).toEqual({
      days: 1,
      subtotal: 4500,
      serviceFee: 315,
      buyerTotal: 4815,
      sellerFee: 315,
      sellerNet: 4185,
    })
  })

  it('is zero when both dates match', () => {
    expect(reservationPricing('2026-09-15', '2026-09-15', 4500)).toEqual({
      days: 0,
      subtotal: 0,
      serviceFee: 0,
      buyerTotal: 0,
      sellerFee: 0,
      sellerNet: 0,
    })
  })

  it('rounds the fees to whole cents and keeps the totals consistent', () => {
    const pricing = reservationPricing('2026-09-15', '2026-09-16', 999)
    expect(pricing.serviceFee).toBe(70)
    expect(pricing.sellerFee).toBe(70)
    expect(pricing.buyerTotal - pricing.subtotal).toBe(pricing.serviceFee)
    expect(pricing.subtotal - pricing.sellerNet).toBe(pricing.sellerFee)
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
