import { describe, expect, it } from 'vitest'
import { formatDate, toISO } from './dates'

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
