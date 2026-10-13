import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { reservationsService } from '@/services/reservations.service'
import { queryKeys } from '@/constants/query-keys'
import { LIST_PAGE_SIZE } from '@/constants/lists'
import type {
  CreateReservationRequest,
  Reservation,
} from '@/types/reservation'

function invalidateReservationCaches(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: ['reservations'] })
  queryClient.invalidateQueries({ queryKey: ['reservations', 'seller'] })
  queryClient.invalidateQueries({ queryKey: ['cars'] })
  queryClient.invalidateQueries({ queryKey: ['car'] })
  queryClient.invalidateQueries({ queryKey: ['reservation'] })
}

// Los listados del comprador y del vendedor son arrays planos: se pide de a una
// página y se corta cuando la última vino incompleta.
export function useMyReservations(limit = LIST_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.reservations(limit),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      reservationsService.list({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (
      page: Reservation[],
      _allPages: Reservation[][],
      lastPageParam: number
    ) => (page.length >= limit ? lastPageParam + limit : undefined),
    refetchOnMount: 'always',
  })
}

export function useSellerReservations(limit = LIST_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.sellerReservations(limit),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      reservationsService.sellerList({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (
      page: Reservation[],
      _allPages: Reservation[][],
      lastPageParam: number
    ) => (page.length >= limit ? lastPageParam + limit : undefined),
    refetchOnMount: 'always',
  })
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: queryKeys.reservation(id),
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

export function useAcceptReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationsService.accept(id),
    onSuccess: () => {
      invalidateReservationCaches(queryClient)
    },
  })
}

export function useRejectReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationsService.reject(id),
    onSuccess: () => {
      invalidateReservationCaches(queryClient)
    },
  })
}
