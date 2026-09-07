import { describe, expect, it } from 'vitest'
import { formatPrice } from './currency'

describe('formatPrice', () => {
  it('formats cents as córdobas', () => {
    expect(formatPrice(45000)).toBe('C$ 450.00')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('C$ 0.00')
  })
})
