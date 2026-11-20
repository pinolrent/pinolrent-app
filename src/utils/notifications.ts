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
    case 'reservation.correction_requested':
      // Los dos avisos que piden un comprobante abren la reserva con el
      // formulario de pago ya desplegado: el paso que toca, sin buscarlo.
      return {
        pathname: '/(authenticated)/(buyer)/reservations/[id]',
        params: { id: reservationId, step: 'payment' },
      }
    case 'reservation.rejected':
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

export interface NotificationStep {
  /** Qué hacer con el aviso, en la voz de quien lo recibe. */
  label: string
  /** El paso depende de quien recibe la notificación. */
  action: boolean
}

// El aviso cuenta lo que pasó; esto cuenta qué sigue. Para el comprador es
// siempre el mismo par de casos (subir el comprobante, coordiná la entrega);
// para el vendedor, aceptar o rechazar; para el admin, validar el pago.
export function notificationAction(
  kind: Notification['kind'],
  area: NotificationArea
): NotificationStep | null {
  if (area === 'admin') {
    // La vista admin es auditoría: no hay acción salvo el comprobante nuevo,
    // que es lo que espera validación.
    return kind === 'reservation.correction_submitted'
      ? { label: 'Hay un comprobante nuevo para validar', action: true }
      : null
  }

  switch (kind) {
    case 'reservation.requested':
      return { label: 'Aceptá o rechazá la solicitud', action: true }
    case 'reservation.accepted':
      return { label: 'Subí el comprobante de pago', action: true }
    case 'reservation.correction_requested':
      return { label: 'Subí un comprobante nuevo', action: true }
    case 'reservation.confirmed':
      return {
        label:
          area === 'seller'
            ? 'Coordiná la entrega con el comprador'
            : 'Coordiná la entrega con el vendedor',
        action: false,
      }
    case 'reservation.rejected':
      return { label: 'El auto vuelve a estar libre', action: false }
    case 'reservation.cancelled':
      return { label: 'El auto vuelve a estar disponible', action: false }
    case 'reservation.correction_submitted':
      return null
  }
}
