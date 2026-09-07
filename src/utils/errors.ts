import axios from 'axios'
import type { ApiError } from '@/types/api'

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(err)) {
    return err.response?.data?.error || err.message || fallback
  }
  return err instanceof Error ? err.message : fallback
}
