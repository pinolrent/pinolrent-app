import api from './api'
import type { CreateReservationRequest, Reservation } from '@/types/reservation'

export const reservationsService = {
  create: (data: CreateReservationRequest) =>
    api.post<Reservation>('/reservations', data).then((r) => r.data),

  list: () => api.get<Reservation[]>('/reservations').then((r) => r.data),

  cancel: (id: number) =>
    api.patch<Reservation>(`/reservations/${id}/cancel`).then((r) => r.data),

  sellerList: () =>
    api.get<Reservation[]>('/seller/reservations').then((r) => r.data),
}