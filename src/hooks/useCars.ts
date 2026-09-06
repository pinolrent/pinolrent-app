import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { carsService } from '@/services/cars.service'
import { queryKeys } from '@/constants/query-keys'
import type { Car, CarsListParams } from '@/types/car'

export interface CarsFilters extends CarsListParams {}

export function useCars(limit = 10, filters?: CarsFilters) {
  const { limit: _ignoredLimit, offset: _ignoredOffset, ...rest } = filters ?? {}
  return useInfiniteQuery({
    queryKey: ['cars', { limit, ...rest }],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      carsService.list({ limit, offset: pageParam, ...rest }),
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
