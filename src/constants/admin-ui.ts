import type { AdminAction, AuditEntry } from '@/types/admin'

export const AUDIT_ACTION_LABELS: Record<AdminAction, string> = {
  'user.suspend': 'Cuenta suspendida',
  'user.unsuspend': 'Cuenta reactivada',
  'user.role_grant_seller': 'Vendedor habilitado',
  'user.role_revoke_seller': 'Vendedor deshabilitado',
  'car.update': 'Auto editado',
  'car.delete': 'Auto eliminado',
  'reservation.accept': 'Reserva aceptada',
  'reservation.reject': 'Reserva rechazada',
  'reservation.cancel': 'Reserva cancelada',
  'reservation.confirm': 'Pago confirmado',
  'reservation.request_correction': 'Corrección pedida',
}

const TARGET_TYPE_LABELS: Record<string, string> = {
  users: 'Cuenta',
  cars: 'Auto',
  reservations: 'Reserva',
}

export function auditTargetLabel(entry: AuditEntry): string {
  const target = TARGET_TYPE_LABELS[entry.target_type] ?? entry.target_type
  return `${target} #${entry.target_id}`
}

export const ROLE_LABELS = {
  buyer: 'Comprador',
  seller: 'Vendedor',
  admin: 'Admin',
} as const
