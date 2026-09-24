import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  sellerCarsService,
  type CreateSellerCarRequest,
  type UpdateSellerCarRequest,
} from '@/services/seller-cars.service'
import { queryKeys } from '@/constants/query-keys'

function invalidateCarCaches(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.sellerCars })
  queryClient.invalidateQueries({ queryKey: ['cars'] })
  queryClient.invalidateQueries({ queryKey: ['car'] })
}

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
      invalidateCarCaches(queryClient)
    },
  })
}

export function useUpdateSellerCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSellerCarRequest }) =>
      sellerCarsService.update(id, data),
    onSuccess: () => {
      invalidateCarCaches(queryClient)
    },
  })
}

export function useDeleteSellerCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sellerCarsService.remove(id),
    onSuccess: () => {
      invalidateCarCaches(queryClient)
    },
  })
}
