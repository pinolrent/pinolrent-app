import axios from 'axios'
import type { ApiError } from '@/types/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'El email es obligatorio'
  if (!EMAIL_RE.test(value.trim())) return 'Ingresa un email válido'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < 8 || value.length > 72)
    return 'La contraseña debe tener entre 8 y 72 caracteres'
  return null
}

// Espeja internal/handlers/phone.go: sin "+" solo se acepta el número
// nacional (PHONE_NATIONAL_LEN dígitos) o el prefijo de país con el nacional.
const PHONE_COUNTRY_PREFIX = '505'
const PHONE_NATIONAL_LEN = 8
const E164_RE = /^\+[1-9][0-9]{7,14}$/

export function validatePhone(value: string, required: boolean): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return required ? 'El teléfono es obligatorio para vendedores' : null
  }
  if (trimmed.length > 32) return 'Ingresa un teléfono válido'
  // El "+" solo vale al inicio, como en la API.
  if (/[^0-9 ().-]/.test(trimmed.replace(/^\+/, '')))
    return 'Ingresa un teléfono válido'
  const digits = trimmed.replace(/\D/g, '')
  const candidate = trimmed.startsWith('+')
    ? `+${digits}`
    : digits.length === PHONE_NATIONAL_LEN
      ? `+${PHONE_COUNTRY_PREFIX}${digits}`
      : digits.length === PHONE_COUNTRY_PREFIX.length + PHONE_NATIONAL_LEN &&
          digits.startsWith(PHONE_COUNTRY_PREFIX)
        ? `+${digits}`
        : null
  if (candidate && E164_RE.test(candidate)) return null
  return 'Ingresa un teléfono válido'
}

const HTTP_URL_RE = /^https?:\/\/.+/i
const UPLOAD_PATH_RE = /^\/uploads\/[^/\\]+\.(jpg|jpeg|png|webp)$/i

export function isImageUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048) return false
  return HTTP_URL_RE.test(trimmed) || UPLOAD_PATH_RE.test(trimmed)
}

export function resolveImageUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('/uploads/')) {
    const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
    return `${base.replace(/\/$/, '')}${trimmed}`
  }
  return trimmed
}

export function isInvalidCredentialsError(err: unknown): boolean {
  if (!axios.isAxiosError<ApiError>(err)) return false
  const data = err.response?.data as ApiError | string | undefined
  const message =
    typeof data === 'string' ? data : (data?.error ?? data?.message)
  return (
    typeof message === 'string' &&
    message.toLowerCase().includes('invalid credentials')
  )
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
    if (typeof data === 'string' && data.trim())
      return translateBackendMessage(data)
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
    return fallback
  }
  return err instanceof Error ? err.message : fallback
}

function flattenErrors(errors: ApiError['errors'] | undefined): string | null {
  if (!errors) return null
  if (Array.isArray(errors)) {
    const first = errors[0]
    if (typeof first === 'string' && first.trim()) return first
    if (first && typeof first === 'object' && first.message)
      return first.message
    return null
  }
  const values = Object.values(errors).flat()
  return values[0] ?? null
}

function translateBackendMessage(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('car is not active'))
    return 'Este auto ya no está disponible'
  if (lower.includes('already reserved') || lower.includes('overlap'))
    return 'Esas fechas se cruzan con otra reserva'
  if (lower.includes('payment is not pending'))
    return 'El pago ya no está pendiente'
  // Antes que el mensaje genérico de la desactivación del auto: la API usa
  // "future reservations" en los dos.
  if (lower.includes('cannot revoke seller'))
    return 'Tiene reservas futuras: resuélvelas antes de quitarle la opción de vender'
  if (lower.includes('future reservations'))
    return 'No se puede desactivar: tiene reservas futuras'
  if (lower.includes('car has reservations, cannot delete'))
    return 'No se puede eliminar: tiene reservas registradas, desactívalo en su lugar'
  if (lower.includes('cannot cancel'))
    return 'Ya registraste un pago para esta reserva: pídele al vendedor que la rechace'
  if (lower.includes('no payment recorded for this reservation'))
    return 'El comprador todavía no registró el pago'
  if (lower.includes('reservation is not accepted'))
    return 'El vendedor todavía no aceptó la reserva'
  if (lower.includes('reservation cannot be longer'))
    return 'La reserva no puede superar los 30 días'
  if (lower.includes('start_date cannot be in the past'))
    return 'La fecha de inicio no puede ser anterior a hoy'
  if (lower.includes('start_date and end_date must be provided together'))
    return 'Elige las dos fechas'
  if (
    lower.includes('invalid start_date') ||
    lower.includes('invalid end_date')
  )
    return 'Selecciona una fecha válida'
  if (lower.includes('end_date must be on or after start_date'))
    return 'La fecha de fin tiene que ser posterior a la de inicio'
  if (lower.includes('car_id is required')) return 'Selecciona un auto'
  if (lower.includes('invalid email')) return 'Ingresa un email válido'
  if (lower.includes('invalid phone')) return 'Ingresa un teléfono válido'
  if (lower.includes('invalid credentials'))
    return 'Email o contraseña incorrectos'
  if (lower.includes('phone is required for sellers'))
    return 'El teléfono es obligatorio para vendedores'
  if (lower.includes('password must be'))
    return 'La contraseña debe tener entre 8 y 72 caracteres'
  if (
    lower.includes('invalid photo_url') ||
    lower.includes('invalid proof_url')
  )
    return 'Imagen inválida: sube una foto o pega una URL válida'
  if (lower.includes('only jpg, png or webp'))
    return 'Solo se permiten imágenes JPG, PNG o WebP'
  if (lower.includes('invalid image data'))
    return 'La imagen está dañada o no se pudo procesar'
  if (lower.includes('image dimensions too large'))
    return 'La imagen es demasiado grande (máx. 50 MP)'
  if (lower.includes('storage quota exceeded'))
    return 'El servidor no tiene espacio para más imágenes'
  if (lower.includes('file is required')) return 'Selecciona una imagen'
  if (lower.includes('seller has no contact phone'))
    return 'El vendedor todavía no cargó un teléfono'
  if (lower.includes('payment already recorded'))
    return 'Esta reserva ya tiene un pago registrado'
  if (lower.includes('reservation is not pending'))
    return 'La reserva ya no está pendiente'
  if (lower.includes('account suspended'))
    return 'Tu cuenta está suspendida: contacta a soporte'
  if (lower.includes('insufficient permissions'))
    return 'No tienes permiso para esta acción'
  if (
    lower.includes('invalid or expired token') ||
    lower.includes('missing bearer token')
  )
    return 'Tu sesión expiró, inicia sesión de nuevo'
  if (lower.includes('cannot suspend yourself'))
    return 'No puedes suspender tu propia cuenta'
  if (lower.includes('user has no phone number'))
    return 'Esa cuenta no tiene teléfono registrado'
  if (lower.includes('user not found')) return 'No encontramos esa cuenta'
  if (lower.includes('car not found')) return 'No encontramos ese auto'
  if (lower.includes('reservation not found'))
    return 'No encontramos esa reserva'
  if (lower.includes('no fields to update')) return 'No hay cambios que guardar'
  if (lower.includes('name is required'))
    return 'El nombre del auto es obligatorio'
  if (lower.includes('name is too long'))
    return 'El nombre del auto es demasiado largo (máx. 200 caracteres)'
  if (lower.includes('price_per_day must be'))
    return 'El precio por día no es válido'
  if (
    lower.includes('invalid status') ||
    lower.includes('invalid limit') ||
    lower.includes('invalid offset') ||
    lower.includes('invalid active') ||
    lower.includes('invalid kind') ||
    lower.includes('invalid unread') ||
    lower.includes('invalid owner_id') ||
    lower.includes('invalid user_id') ||
    lower.includes('invalid car_id') ||
    lower.includes('invalid actor_id') ||
    lower.includes('invalid reservation_id') ||
    lower.includes('suspended is required') ||
    lower.includes('seller is required')
  )
    return 'Revisa los filtros e inténtalo de nuevo'
  if (lower.includes('invalid user id')) return 'No encontramos esa cuenta'
  if (lower.includes('invalid car id')) return 'No encontramos ese auto'
  if (lower.includes('invalid reservation id'))
    return 'No encontramos esa reserva'
  if (lower.includes('database is busy'))
    return 'El servidor está ocupado, reintenta en un momento'
  if (lower.includes('too many requests'))
    return 'Demasiados intentos, espera un minuto y reintenta'
  return msg
}

function statusFallback(status?: number): string | null {
  if (status === 400) return 'Revisa los datos e inténtalo de nuevo'
  if (status === 401) return 'Tu sesión expiró, inicia sesión de nuevo'
  if (status === 403) return 'No tienes permiso para esta acción'
  if (status === 404) return 'No encontramos lo que buscabas'
  if (status === 408) return 'La solicitud tardó demasiado, reintenta'
  if (status === 409) return 'El estado cambió, recarga e inténtalo de nuevo'
  if (status === 413) return 'El archivo es demasiado grande'
  if (status === 415) return 'El formato del archivo no es compatible'
  if (status === 422) return 'Revisa los datos e inténtalo de nuevo'
  if (status === 429) return 'Demasiados intentos, espera un minuto y reintenta'
  if (status === 507) return 'El servidor no tiene espacio para más imágenes'
  if (status && status >= 500)
    return 'No pudimos completar la acción, reintenta en unos minutos'
  return null
}
