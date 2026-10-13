import { type Href } from 'expo-router'
import type { Notification } from '@/types/notification'

export type NotificationArea = 'buyer' | 'seller' | 'admin'

// Una notificación no dice en qué "capacidad" llegó al usuario; se infiere
// del tipo de evento (owner-side vs buyer-side). El área solo intercala
// `confirmed`, que llega al buyer, al dueño y a los admins: se enlaza al
// detalle que corresponde al área actual. Vista admin → null: no hay detalle
// de reserva para auditores.
export function notificationTarget(
  kind: Notification['kind'],
  area: NotificationArea,
  reservationId: number
): Href | null {
  // La vista admin es solo auditoría: no enlaza a detalle de reserva.
  if (area === 'admin') return null
  switch (kind) {
    case 'reservation.requested':
    case 'reservation.cancelled':
      return `/(authenticated)/seller/reservations/${reservationId}`
    case 'reservation.accepted':
    case 'reservation.rejected':
    case 'reservation.correction_requested':
      return `/(authenticated)/(buyer)/reservations/${reservationId}`
    case 'reservation.confirmed':
      return area === 'seller'
        ? `/(authenticated)/seller/reservations/${reservationId}`
        : `/(authenticated)/(buyer)/reservations/${reservationId}`
  }
  return null
}

// Comodidad de la fila: navegable salvo en la vista admin.
export function isNotificationNavigable(
  kind: Notification['kind'],
  area: NotificationArea
): boolean {
  return notificationTarget(kind, area, 0) !== null
}
