import type { Reservation } from '@/types/reservation'

export const STATUS_LABELS: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

export const STATUS_TONES: Record<
  Reservation['status'],
  'warning' | 'success' | 'muted'
> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'muted',
}
