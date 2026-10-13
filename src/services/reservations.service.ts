import api from './api'
import type { ListParams } from '@/types/api'
import type { CreateReservationRequest, Reservation } from '@/types/reservation'

export const reservationsService = {
  create: (data: CreateReservationRequest) =>
    api.post<Reservation>('/reservations', data).then((r) => r.data),

  list: (params?: ListParams) =>
    api.get<Reservation[]>('/reservations', { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Reservation>(`/reservations/${id}`).then((r) => r.data),

  cancel: (id: number) =>
    api.patch<Reservation>(`/reservations/${id}/cancel`).then((r) => r.data),

  sellerList: (params?: ListParams) =>
    api
      .get<Reservation[]>('/seller/reservations', { params })
      .then((r) => r.data),

  accept: (id: number) =>
    api
      .patch<Reservation>(`/seller/reservations/${id}/accept`)
      .then((r) => r.data),

  reject: (id: number) =>
    api
      .patch<Reservation>(`/seller/reservations/${id}/reject`)
      .then((r) => r.data),
}
