import { describe, expect, it } from 'vitest'
import { reservationTotal } from './reservations'

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
