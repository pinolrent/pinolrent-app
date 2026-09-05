import api from './api'
import type { Car, CarsListParams } from '@/types/car'

export interface CreateSellerCarRequest {
  name: string
  photo_url?: string
  price_per_day?: number
}

export const sellerCarsService = {
  list: (params?: CarsListParams) =>
    api.get<Car[]>('/seller/cars', { params }).then((r) => r.data),

  create: (data: CreateSellerCarRequest) =>
    api.post<Car>('/seller/cars', data).then((r) => r.data),

  setActive: (id: number, active: boolean) =>
    api.patch<Car>(`/seller/cars/${id}`, { active }).then((r) => r.data),
}
