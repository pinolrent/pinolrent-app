import axios from 'axios'
import { describe, expect, it } from 'vitest'
import {
  getApiErrorMessage,
  isHttpUrl,
  validateEmail,
  validatePassword,
} from './errors'

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

  it('reads message and errors shapes', () => {
    const withMessage = {
      isAxiosError: true,
      response: { data: { message: 'not found' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(withMessage, 'fallback')).toBe('not found')
    const withList = {
      isAxiosError: true,
      response: { data: { errors: ['bad input'] } },
      message: 'axios',
    }
    expect(getApiErrorMessage(withList, 'fallback')).toBe('bad input')
  })

  it('maps offline and timeout to spanish', () => {
    const offline = { isAxiosError: true, message: 'Network Error' }
    expect(getApiErrorMessage(offline, 'fallback')).toBe(
      'Sin conexión, revisa tu red y reintenta'
    )
    const timeout = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout',
    }
    expect(getApiErrorMessage(timeout, 'fallback')).toBe(
      'La solicitud tardó demasiado, reintenta'
    )
  })

  it('translates overlap and pending payment', () => {
    const overlap = {
      isAxiosError: true,
      response: { data: { error: 'dates overlap existing' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(overlap, 'fallback')).toBe(
      'Esas fechas se cruzan con otra reserva'
    )
  })
})

describe('validators', () => {
  it('validates email', () => {
    expect(validateEmail('')).toBe('El email es obligatorio')
    expect(validateEmail('no-es-email')).toBe('Email inválido')
    expect(validateEmail('  user@mail.com  ')).toBeNull()
  })

  it('validates password length', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria')
    expect(validatePassword('1234567')).toBe(
      'La contraseña debe tener al menos 8 caracteres'
    )
    expect(validatePassword('12345678')).toBeNull()
  })

  it('validates http urls', () => {
    expect(isHttpUrl('https://x.com/a.jpg')).toBe(true)
    expect(isHttpUrl('nota-url')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
  })
})
