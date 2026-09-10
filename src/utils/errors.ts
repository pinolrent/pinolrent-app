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

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(err)) {
    return err.response?.data?.error || err.message || fallback
  }
  return err instanceof Error ? err.message : fallback
}
