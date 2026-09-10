import axios from 'axios'
import type { ApiError } from '@/types/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'El email es obligatorio'
  if (!EMAIL_RE.test(value.trim())) return 'Email inválido'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  return null
}

const HTTP_URL_RE = /^https?:\/\/.+/i

export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048) return false
  return HTTP_URL_RE.test(trimmed)
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(err)) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return 'La solicitud tardó demasiado, reintenta'
      }
      return 'Sin conexión, revisa tu red y reintenta'
    }
    const data = err.response.data as ApiError | string | undefined
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if (typeof data.error === 'string' && data.error.trim())
        return translateBackendMessage(data.error)
      if (typeof data.message === 'string' && data.message.trim())
        return translateBackendMessage(data.message)
      const fromErrors = flattenErrors(data.errors)
      if (fromErrors) return translateBackendMessage(fromErrors)
    }
    const statusMessage = statusFallback(err.response.status)
    if (statusMessage) return statusMessage
    return err.message || fallback
  }
  return err instanceof Error ? err.message : fallback
}

function flattenErrors(
  errors: ApiError['errors'] | undefined
): string | null {
  if (!errors) return null
  if (Array.isArray(errors)) {
    const first = errors[0]
    if (typeof first === 'string' && first.trim()) return first
    if (first && typeof first === 'object' && first.message) return first.message
    return null
  }
  const values = Object.values(errors).flat()
  return values[0] ?? null
}

function translateBackendMessage(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('overlap')) return 'Esas fechas se cruzan con otra reserva'
  if (lower.includes('payment is not pending'))
    return 'El pago ya no está pendiente'
  if (lower.includes('future reservations'))
    return 'No se puede desactivar: tiene reservas futuras'
  return msg
}

function statusFallback(status?: number): string | null {
  if (status === 400) return 'Solicitud inválida, revisa los datos'
  if (status === 401) return 'Sesión expirada, inicia sesión de nuevo'
  if (status === 403) return 'No tienes permiso para esta acción'
  if (status === 404) return 'No encontrado, puede que ya no exista'
  if (status === 409) return 'Conflicto con el estado actual, recarga e reintenta'
  if (status && status >= 500) return 'Error del servidor, reintenta más tarde'
  return null
}
