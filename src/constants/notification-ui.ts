import type { NotificationKind } from '@/types/notification'

// Etiquetas para la lista de notificaciones. El `kind` viaja del API en
// snake_case; aquí se le da la forma que ve el usuario.
export const NOTIFICATION_LABELS: Record<NotificationKind, string> = {
  'reservation.requested': 'Nueva solicitud de reserva',
  'reservation.accepted': 'Reserva aceptada',
  'reservation.rejected': 'Reserva rechazada',
  'reservation.confirmed': 'Reserva confirmada',
  'reservation.correction_requested': 'Corrección solicitada',
  'reservation.cancelled': 'Reserva cancelada',
  'reservation.correction_submitted': 'Comprobante corregido',
}
