import { describe, expect, it } from 'vitest'
import { formatPrice, formatUSD } from './currency'

describe('formatUSD', () => {
  it('converts cents to dollars', () => {
    expect(formatUSD(45000)).toBe('$450.00')
  })

  it('formats zero', () => {
    expect(formatUSD(0)).toBe('$0.00')
  })
})

describe('formatPrice', () => {
  it('is an alias of formatUSD', () => {
    expect(formatPrice(45000)).toBe('$450.00')
  })
})
