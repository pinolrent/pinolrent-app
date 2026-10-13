import api from './api'
import type { Car } from '@/types/car'
import type { Reservation } from '@/types/reservation'
import type {
  AdminAuditFilters,
  AdminCar,
  AdminCarFilters,
  AdminListResponse,
  AdminPayment,
  AdminPaymentFilters,
  AdminReservation,
  AdminReservationFilters,
  AdminStats,
  AdminUser,
  AdminUserFilters,
  AuditEntry,
} from '@/types/admin'

export type UpdateAdminCarRequest = Partial<
  Pick<Car, 'name' | 'photo_url' | 'price_per_day' | 'active'>
>

// Los filtros vacíos se omiten: la API trata un parámetro en blanco como su
// valor por defecto, pero es más claro no mandarlos.
function clean<T extends object>(params?: T) {
  if (!params) return undefined
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== ''
  )
  return entries.length ? Object.fromEntries(entries) : undefined
}

export const adminService = {
  users: (params?: AdminUserFilters) =>
    api
      .get<AdminListResponse<AdminUser>>('/admin/users', {
        params: clean(params),
      })
      .then((r) => r.data),

  user: (id: number) =>
    api.get<AdminUser>(`/admin/users/${id}`).then((r) => r.data),

  setUserSuspended: (id: number, suspended: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}`, { suspended }).then((r) => r.data),

  setUserSeller: (id: number, seller: boolean) =>
    api
      .patch<AdminUser>(`/admin/users/${id}/roles`, { seller })
      .then((r) => r.data),

  cars: (params?: AdminCarFilters) =>
    api
      .get<AdminListResponse<AdminCar>>('/admin/cars', {
        params: clean(params),
      })
      .then((r) => r.data),

  // El PATCH del admin responde {"status":"ok"}, no el auto.
  updateCar: (id: number, data: UpdateAdminCarRequest) =>
    api
      .patch<{ status: string }>(`/admin/cars/${id}`, data)
      .then((r) => r.data),

  deleteCar: (id: number) =>
    api.delete<{ status: string }>(`/admin/cars/${id}`).then((r) => r.data),

  reservations: (params?: AdminReservationFilters) =>
    api
      .get<AdminListResponse<AdminReservation>>('/admin/reservations', {
        params: clean(params),
      })
      .then((r) => r.data),

  confirmReservation: (id: number) =>
    api
      .patch<Reservation>(`/admin/reservations/${id}/confirm`)
      .then((r) => r.data),

  requestCorrection: (id: number) =>
    api
      .patch<Reservation>(`/admin/reservations/${id}/request-correction`)
      .then((r) => r.data),

  payments: (params?: AdminPaymentFilters) =>
    api
      .get<AdminListResponse<AdminPayment>>('/admin/payments', {
        params: clean(params),
      })
      .then((r) => r.data),

  stats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),

  audit: (params?: AdminAuditFilters) =>
    api
      .get<AdminListResponse<AuditEntry>>('/admin/audit', {
        params: clean(params),
      })
      .then((r) => r.data),
}
