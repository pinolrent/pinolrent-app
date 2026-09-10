import type { Payment } from '@/types/payment'

export const PAYMENT_METHOD_LABELS: Record<Payment['method'], string> = {
  pos: 'Terminal',
  cash: 'Efectivo',
}

export const PAYMENT_STATUS_LABELS: Record<Payment['status'], string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

export const PAYMENT_STATUS_TONES: Record<
  Payment['status'],
  'warning' | 'success' | 'destructive'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}
