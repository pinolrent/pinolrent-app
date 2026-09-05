import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationsService } from '@/services/reservations.service'
import type { CreateReservationRequest } from '@/types/reservation'

export function useMyReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsService.list,
    refetchOnMount: 'always',
  })
}

export function useSellerReservations() {
  return useQuery({
    queryKey: ['reservations', 'seller'],
    queryFn: reservationsService.sellerList,
    refetchOnMount: 'always',
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}