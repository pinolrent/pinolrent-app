import type { Role, User } from './auth'
import type { Car } from './car'
import type { Payment } from './payment'
import type { Reservation } from './reservation'

// Todas las rutas /admin/* devuelven listados paginados con esta envoltura.
export interface AdminListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface AdminListParams {
  limit?: number
  offset?: number
}

// El listado omite phone cuando la cuenta no tiene; el detalle y las
// respuestas de PATCH siempre lo incluyen. suspended_at (Unix) solo aparece
// mientras la cuenta está suspendida.
export interface AdminUser extends Omit<User, 'phone'> {
  phone?: string
  suspended_at?: number
}

export interface AdminUserFilters extends AdminListParams {
  q?: string
  role?: Role
}

export interface AdminCar extends Car {
  owner_email?: string
}

export interface AdminCarFilters extends AdminListParams {
  q?: string
  owner_id?: number
  active?: boolean
}

// El listado de reservas resuelve buyer_email y car_name: no trae car ni
// payment como la vista del comprador.
export interface AdminReservation {
  id: number
  user_id: number
  car_id: number
  start_date: string
  end_date: string
  status: Reservation['status']
  buyer_email?: string
  car_name?: string
}

export interface AdminReservationFilters extends AdminListParams {
  status?: Reservation['status']
  user_id?: number
  car_id?: number
}

export interface AdminPayment extends Payment {
  user_id?: number
  car_id?: number
  buyer_email?: string
}

export interface AdminPaymentFilters extends AdminListParams {
  status?: Payment['status']
  reservation_id?: number
}

export interface AdminStats {
  users: { total: number; sellers: number; admins: number; suspended: number }
  cars: { active: number }
  reservations: Record<Reservation['status'], number>
  payments: {
    pending: number
    approved: number
    rejected: number
    approved_total: number
  }
}

// Las acciones que el API registra en la auditoría.
export const ADMIN_ACTIONS = [
  'user.suspend',
  'user.unsuspend',
  'user.role_grant_seller',
  'user.role_revoke_seller',
  'car.update',
  'car.delete',
  'reservation.accept',
  'reservation.reject',
  'reservation.cancel',
  'reservation.confirm',
  'reservation.request_correction',
] as const

export type AdminAction = (typeof ADMIN_ACTIONS)[number]

export interface AuditEntry {
  id: number
  actor_id: number
  actor_email?: string
  action: AdminAction
  target_type: string
  target_id: number
  detail?: string
  created_at: string
}

export interface AdminAuditFilters extends AdminListParams {
  actor_id?: number
  action?: AdminAction
}
