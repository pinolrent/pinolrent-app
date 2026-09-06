import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  sellerCarsService,
  type CreateSellerCarRequest,
} from '@/services/seller-cars.service'
import { queryKeys } from '@/constants/query-keys'

export function useSellerCars() {
  return useQuery({
    queryKey: queryKeys.sellerCars,
    queryFn: () => sellerCarsService.list(),
    refetchOnMount: 'always',
  })
}

export function useCreateSellerCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSellerCarRequest) =>
      sellerCarsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerCars })
      queryClient.invalidateQueries({ queryKey: queryKeys.cars() })
      queryClient.invalidateQueries({ queryKey: ['car'] })
    },
  })
}

export function useToggleSellerCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      sellerCarsService.setActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerCars })
      queryClient.invalidateQueries({ queryKey: queryKeys.cars() })
      queryClient.invalidateQueries({ queryKey: ['car'] })
    },
  })
}
