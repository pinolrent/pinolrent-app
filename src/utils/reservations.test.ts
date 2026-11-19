import { describe, expect, it } from 'vitest'
import {
  MAX_RESERVATION_NIGHTS,
  buyerNextStep,
  isValidReservationRange,
  reservationPricing,
  reservationRangeError,
} from './reservations'
import type { Reservation } from '@/types/reservation'

describe('reservationPricing', () => {
  it('applies the service fee and the seller deduction to the subtotal', () => {
    expect(reservationPricing('2026-09-15', '2026-09-18', 4500)).toEqual({
      days: 4,
      subtotal: 18000,
      serviceFee: 1260,
      buyerTotal: 19260,
      sellerFee: 1260,
      sellerNet: 16740,
    })
  })

  it('handles a single day', () => {
    expect(reservationPricing('2026-09-15', '2026-09-16', 4500)).toEqual({
      days: 2,
      subtotal: 9000,
      serviceFee: 630,
      buyerTotal: 9630,
      sellerFee: 630,
      sellerNet: 8370,
    })
  })

  it('is one day when both dates match (inclusive count)', () => {
    expect(reservationPricing('2026-09-15', '2026-09-15', 4500)).toEqual({
      days: 1,
      subtotal: 4500,
      serviceFee: 315,
      buyerTotal: 4815,
      sellerFee: 315,
      sellerNet: 4185,
    })
  })

  it('rounds the fees to whole cents and keeps the totals consistent', () => {
    const pricing = reservationPricing('2026-09-15', '2026-09-16', 999)
    expect(pricing.serviceFee).toBe(140)
    expect(pricing.sellerFee).toBe(140)
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

  it('allows same-day ranges, rejects reversed ranges', () => {
    expect(reservationRangeError('2026-09-27', '2026-09-27', today)).toBeNull()
    expect(reservationRangeError('2026-09-27', '2026-09-26', today)).toBe(
      'La fecha de fin tiene que ser posterior a la de inicio'
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

describe('buyerNextStep', () => {
  const base = {
    id: 1,
    user_id: 1,
    car_id: 1,
    start_date: '2026-09-27',
    end_date: '2026-09-30',
    car: { id: 1, name: 'Kia Picanto', price_per_day: 4000, active: true },
  } as const

  const reservation = (
    status: Reservation['status'],
    payment?: Reservation['payment']
  ): Reservation => ({ ...base, status, payment }) as Reservation

  const payment = (status: 'pending' | 'approved' | 'rejected') => ({
    id: 1,
    reservation_id: 1,
    method: 'cash' as const,
    status,
  })

  it('waits for the seller while the request is pending', () => {
    expect(buyerNextStep(reservation('pending'))).toEqual({
      label: 'Falta que el vendedor acepte la solicitud',
      action: false,
    })
  })

  it('asks for the proof once the seller accepts', () => {
    expect(buyerNextStep(reservation('accepted')).action).toBe(true)
    expect(buyerNextStep(reservation('accepted')).label).toContain('comprobante')
  })

  it('asks for a new proof when the payment was rejected', () => {
    const step = buyerNextStep(reservation('accepted', payment('rejected')))
    expect(step.action).toBe(true)
    expect(step.label).toContain('rechazado')
  })

  it('stops asking once the payment is in review or approved', () => {
    expect(buyerNextStep(reservation('accepted', payment('pending')))).toEqual({
      label: 'Tu pago está en revisión',
      action: false,
    })
    expect(buyerNextStep(reservation('accepted', payment('approved'))).label).toBe(
      'Pago validado: falta la confirmación del admin'
    )
  })

  it('describes the closed states without action', () => {
    for (const status of ['confirmed', 'rejected', 'cancelled'] as const) {
      expect(buyerNextStep(reservation(status)).action).toBe(false)
    }
    expect(buyerNextStep(reservation('confirmed')).label).toContain(
      'coordiná la entrega'
    )
  })
})
