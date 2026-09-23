import { describe, expect, it } from 'vitest'
import { formatPrice, formatPricePerDay, formatUSD } from './currency'

describe('formatUSD', () => {
  it('converts cents to dollars with the local currency prefix', () => {
    expect(formatUSD(45000)).toBe('US$450')
  })

  it('keeps the cents when they are not zero', () => {
    expect(formatUSD(45050)).toBe('US$450,50')
  })

  it('groups thousands with dots', () => {
    expect(formatUSD(135000)).toBe('US$1.350')
    expect(formatUSD(123456789)).toBe('US$1.234.567,89')
  })

  it('formats zero', () => {
    expect(formatUSD(0)).toBe('US$0')
  })

  it('formats negatives with a leading sign', () => {
    expect(formatUSD(-45050)).toBe('-US$450,50')
  })
})

describe('formatPrice', () => {
  it('is an alias of formatUSD', () => {
    expect(formatPrice(45000)).toBe('US$450')
  })
})

describe('formatPricePerDay', () => {
  it('appends the per day suffix', () => {
    expect(formatPricePerDay(45000)).toBe('US$450 / día')
  })
})
