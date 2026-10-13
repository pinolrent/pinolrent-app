// El API escribe una notificación in-app por cada transición de reserva. No
// hay entrega externa (ni email ni push): el cliente sonda la lista. Los
// `created_at` del API son UTC sin zona; el cliente los muestra en la zona de
// negocio (ver formatApiTimestamp). ReadAt no viaja serializado: el estado de
// lectura va por `read`.
export const NOTIFICATION_KINDS = [
  'reservation.requested',
  'reservation.accepted',
  'reservation.rejected',
  'reservation.confirmed',
  'reservation.correction_requested',
  'reservation.cancelled',
] as const

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number]

export interface Notification {
  id: number
  user_id: number
  kind: NotificationKind
  reservation_id: number
  read: boolean
  created_at: string
}

export interface NotificationFilters {
  unread?: boolean
  limit?: number
  offset?: number
}
