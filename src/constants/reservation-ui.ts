import type { Reservation } from '@/types/reservation'

export const STATUS_LABELS: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

export const STATUS_TONES: Record<
  Reservation['status'],
  'warning' | 'success' | 'destructive'
> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
}

export const SERVICE_FEE_LABEL = 'Cargo por servicio'
export const SELLER_FEE_LABEL = 'Deducción por servicio'
export const TOTAL_DUE_LABEL = 'Total a pagar'
export const SELLER_NET_LABEL = 'Recibes'
