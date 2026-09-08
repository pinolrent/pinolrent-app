import { describe, expect, it } from 'vitest'
import { daysBetween, formatDate, toISO } from './dates'

describe('formatDate', () => {
  it('formats YYYY-MM-DD as DD/MM/YYYY', () => {
    expect(formatDate('2026-10-01')).toBe('01/10/2026')
  })
})

describe('toISO', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISO(new Date(2026, 9, 5))).toBe('2026-10-05')
  })
})

describe('daysBetween', () => {
  it('counts exclusive days (02/11 to 04/11 is 2)', () => {
    expect(daysBetween('2026-11-02', '2026-11-04')).toBe(2)
  })

  it('same day is zero', () => {
    expect(daysBetween('2026-11-02', '2026-11-02')).toBe(0)
  })
})
