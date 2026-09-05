import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '@/services/payments.service'
import type { CreatePaymentRequest } from '@/types/payment'

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      reservationId,
      data,
    }: {
      reservationId: number
      data: CreatePaymentRequest
    }) => paymentsService.create(reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
