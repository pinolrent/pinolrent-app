import api from './api'
import type {
  CreatePaymentRequest,
  Payment,
} from '@/types/payment'

export const paymentsService = {
  create: (reservationId: number, data: CreatePaymentRequest) =>
    api
      .post<Payment>(`/reservations/${reservationId}/payment`, data)
      .then((r) => r.data),
}
