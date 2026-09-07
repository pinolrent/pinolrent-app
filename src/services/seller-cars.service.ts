import api from './api'
import type { Car, CarsListParams } from '@/types/car'

export type CreateSellerCarRequest = Pick<Car, 'name' | 'photo_url' | 'price_per_day'>

export const sellerCarsService = {
  list: (params?: CarsListParams) =>
    api.get<Car[]>('/seller/cars', { params }).then((r) => r.data),

  create: (data: CreateSellerCarRequest) =>
    api.post<Car>('/seller/cars', data).then((r) => r.data),

  setActive: (id: number, active: boolean) =>
    api.patch<Car>(`/seller/cars/${id}`, { active }).then((r) => r.data),
}
