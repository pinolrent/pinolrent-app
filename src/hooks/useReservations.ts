import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationsService } from '@/services/reservations.service'
import { queryKeys } from '@/constants/query-keys'
import type { CreateReservationRequest } from '@/types/reservation'

function invalidateReservationCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.reservations })
  queryClient.invalidateQueries({ queryKey: queryKeys.sellerReservations })
  queryClient.invalidateQueries({ queryKey: ['cars'] })
  queryClient.invalidateQueries({ queryKey: ['car'] })
}

export function useMyReservations() {
  return useQuery({
    queryKey: queryKeys.reservations,
    queryFn: reservationsService.list,
    refetchOnMount: 'always',
  })
}

export function useSellerReservations() {
  return useQuery({
    queryKey: queryKeys.sellerReservations,
    queryFn: reservationsService.sellerList,
    refetchOnMount: 'always',
  })
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationsService.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationsService.create(data),
    onSuccess: () => {
      invalidateReservationCaches(queryClient)
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationsService.cancel(id),
    onSuccess: () => {
      invalidateReservationCaches(queryClient)
    },
  })
}

export function useConfirmReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationsService.confirm(id),
    onSuccess: () => {
      invalidateReservationCaches(queryClient)
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerCars })
    },
  })
}
