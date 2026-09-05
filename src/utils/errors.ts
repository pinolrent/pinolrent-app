import axios from 'axios'

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(err)) {
    return err.response?.data?.error || err.message || fallback
  }
  return err instanceof Error ? err.message : fallback
}
