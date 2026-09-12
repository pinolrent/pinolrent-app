import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { carsService } from '@/services/cars.service'
import { queryKeys } from '@/constants/query-keys'
import type { Car, CarsListParams } from '@/types/car'

export function useCars(limit = 10, filters?: CarsListParams) {
  const { limit: _limit, offset: _offset, ...rest } = filters ?? {}
  void _limit
  void _offset
  return useInfiniteQuery({
    queryKey: queryKeys.cars(limit, rest),
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

export function useCarContact(id: number) {
  return useQuery({
    queryKey: [...queryKeys.car(id), 'contact'],
    queryFn: () => carsService.contact(id),
    enabled: Number.isFinite(id),
  })
}
