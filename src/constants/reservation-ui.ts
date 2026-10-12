import type { Reservation } from '@/types/reservation'

export const STATUS_LABELS: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  confirmed: 'Confirmada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
}

export const STATUS_TONES: Record<
  Reservation['status'],
  'warning' | 'info' | 'success' | 'destructive'
> = {
  pending: 'warning',
  accepted: 'info',
  confirmed: 'success',
  rejected: 'destructive',
  cancelled: 'destructive',
}

export const SERVICE_FEE_LABEL = 'Cargo por servicio'
export const SELLER_FEE_LABEL = 'Deducción por servicio'
export const TOTAL_DUE_LABEL = 'Total a pagar'
export const SELLER_NET_LABEL = 'Recibes'
