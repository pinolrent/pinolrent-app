import type { Reservation } from '@/types/reservation'

export const STATUS_LABELS: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

export const STATUS_COLORS: Record<Reservation['status'], string> = {
  pending: '#b45309',
  confirmed: '#15803d',
  cancelled: '#6b7280',
}
