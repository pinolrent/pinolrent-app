import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './errors'

describe('getApiErrorMessage', () => {
  it('reads the API error field', () => {
    const err = {
      isAxiosError: true,
      response: { data: { error: 'car is not active' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe('car is not active')
  })

  it('falls back for plain errors', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
  })

  it('falls back for unknown values', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback')
  })

  it('detects real axios errors', () => {
    expect(axios.isAxiosError({ isAxiosError: true })).toBe(true)
  })
})
