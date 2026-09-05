import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { carsService } from '@/services/cars.service'
import type { Car } from '@/types/car'

export function useCars(limit = 10) {
  return useInfiniteQuery<Car[], Error>({
    queryKey: ['cars', { limit }],
    queryFn: ({ pageParam }) =>
      carsService.list({ limit, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (page, _allPages, lastPageParam) =>
      page.length > limit ? (lastPageParam as number) + limit : undefined,
  })
}

export function useCar(id: number) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: () => carsService.get(id),
  })
}