import axios from 'axios'
import { describe, expect, it } from 'vitest'
import {
  getApiErrorMessage,
  isHttpUrl,
  isImageUrl,
  resolveImageUrl,
  validateEmail,
  validatePassword,
  validatePhone,
} from './errors'

describe('getApiErrorMessage', () => {
  it('reads the API error field', () => {
    const err = {
      isAxiosError: true,
      response: { data: { error: 'something unmapped' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe('something unmapped')
  })

  it('translates known backend messages', () => {
    const inactive = {
      isAxiosError: true,
      response: { data: { error: 'car is not active' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(inactive, 'fallback')).toBe(
      'Este auto ya no está disponible'
    )
  })

  it('translates a string body instead of returning it raw', () => {
    const err = {
      isAxiosError: true,
      response: { data: 'dates overlap existing', status: 409 },
      message: 'axios',
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe(
      'Esas fechas se cruzan con otra reserva'
    )
  })

  it('never leaks the axios message for an unmapped status', () => {
    const err = {
      isAxiosError: true,
      response: { status: 418, data: {} },
      message: 'Request failed with status code 418',
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe('fallback')
  })

  it('maps the remaining statuses to spanish', () => {
    const status = (code: number) => ({
      isAxiosError: true,
      response: { status: code, data: {} },
      message: 'axios',
    })
    expect(getApiErrorMessage(status(408), 'fallback')).toBe(
      'La solicitud tardó demasiado, reintenta'
    )
    expect(getApiErrorMessage(status(413), 'fallback')).toBe(
      'El archivo es demasiado grande'
    )
    expect(getApiErrorMessage(status(415), 'fallback')).toBe(
      'El formato del archivo no es compatible'
    )
    expect(getApiErrorMessage(status(422), 'fallback')).toBe(
      'Revisa los datos e inténtalo de nuevo'
    )
    expect(getApiErrorMessage(status(429), 'fallback')).toBe(
      'Demasiados intentos, espera un minuto y reintenta'
    )
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
    expect(validateEmail('no-es-email')).toBe('Ingresa un email válido')
    expect(validateEmail('  user@mail.com  ')).toBeNull()
  })

  it('validates password length', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria')
    expect(validatePassword('1234567')).toBe(
      'La contraseña debe tener entre 8 y 72 caracteres'
    )
    expect(validatePassword('12345678')).toBeNull()
    expect(validatePassword('x'.repeat(73))).toBe(
      'La contraseña debe tener entre 8 y 72 caracteres'
    )
  })

  it('validates http urls', () => {
    expect(isHttpUrl('https://x.com/a.jpg')).toBe(true)
    expect(isHttpUrl('nota-url')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
  })

  it('accepts backend upload paths as images', () => {
    expect(isImageUrl('/uploads/abc123.jpg')).toBe(true)
    expect(isImageUrl('/uploads/abc123.png')).toBe(true)
    expect(isImageUrl('/uploads/../evil.jpg')).toBe(false)
    expect(isImageUrl('/uploads/doc.pdf')).toBe(false)
    expect(isImageUrl('nota-url')).toBe(false)
  })

  it('resolves upload paths against the api url', () => {
    expect(resolveImageUrl('/uploads/a.jpg')).toContain('/uploads/a.jpg')
    expect(resolveImageUrl('https://x.com/a.jpg')).toBe('https://x.com/a.jpg')
    expect(resolveImageUrl('')).toBeUndefined()
  })

  it('translates new backend messages', () => {
    const tooLong = {
      isAxiosError: true,
      response: { data: { error: 'reservation cannot be longer than 30 days' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(tooLong, 'fallback')).toBe(
      'La reserva no puede superar los 30 días'
    )
    const throttled = {
      isAxiosError: true,
      response: { data: { error: 'too many requests' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(throttled, 'fallback')).toBe(
      'Demasiados intentos, espera un minuto y reintenta'
    )
    const noPhone = {
      isAxiosError: true,
      response: { data: { error: 'phone is required for sellers' } },
      message: 'axios',
    }
    expect(getApiErrorMessage(noPhone, 'fallback')).toBe(
      'El teléfono es obligatorio para vendedores'
    )
  })

  it('validates phone numbers', () => {
    expect(validatePhone('', true)).toBe(
      'El teléfono es obligatorio para vendedores'
    )
    expect(validatePhone('', false)).toBeNull()
    expect(validatePhone('912345678', true)).toBeNull()
    expect(validatePhone('+56912345678', true)).toBeNull()
    expect(validatePhone('abc', true)).toBe('Ingresa un teléfono válido')
  })
})
