import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  sellerCarsService,
  type CreateSellerCarRequest,
  type UpdateSellerCarRequest,
} from '@/services/seller-cars.service'
import { queryKeys } from '@/constants/query-keys'
import { LIST_PAGE_SIZE } from '@/constants/lists'
import type { Car } from '@/types/car'

function invalidateCarCaches(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: ['seller-cars'] })
  queryClient.invalidateQueries({ queryKey: ['cars'] })
  queryClient.invalidateQueries({ queryKey: ['car'] })
}

export function useSellerCars(limit = LIST_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.sellerCars(limit),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      sellerCarsService.list({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (
      page: Car[],
      _allPages: Car[][],
      lastPageParam: number
    ) => (page.length >= limit ? lastPageParam + limit : undefined),
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
