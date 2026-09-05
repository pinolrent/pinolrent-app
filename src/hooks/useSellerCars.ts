import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  sellerCarsService,
  type CreateSellerCarRequest,
} from '@/services/seller-cars.service'

export function useSellerCars() {
  return useQuery({
    queryKey: ['seller-cars'],
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
      queryClient.invalidateQueries({ queryKey: ['seller-cars'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}

export function useToggleSellerCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      sellerCarsService.setActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-cars'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}
