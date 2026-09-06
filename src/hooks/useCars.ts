import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { carsService } from '@/services/cars.service'
import { queryKeys } from '@/constants/query-keys'
import type { Car } from '@/types/car'

export function useCars(limit = 10) {
  return useInfiniteQuery({
    queryKey: ['cars', { limit }],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      carsService.list({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (
      page: Car[],
      _allPages: Car[][],
      lastPageParam: number
    ) => (page.length >= limit ? lastPageParam + limit : undefined),
  })
}

export function useCar(id: number) {
  return useQuery({
    queryKey: queryKeys.car(id),
    queryFn: () => carsService.get(id),
    enabled: Number.isFinite(id),
  })
}
