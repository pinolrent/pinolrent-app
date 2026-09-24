import api from './api'
import type { Car, CarsListParams } from '@/types/car'

export type CreateSellerCarRequest = Pick<Car, 'name'> &
  Partial<Pick<Car, 'photo_url' | 'price_per_day'>>

export type UpdateSellerCarRequest = Partial<
  Pick<Car, 'name' | 'photo_url' | 'price_per_day' | 'active'>
>

export const sellerCarsService = {
  list: (params?: CarsListParams) =>
    api.get<Car[]>('/seller/cars', { params }).then((r) => r.data),

  create: (data: CreateSellerCarRequest) =>
    api.post<Car>('/seller/cars', data).then((r) => r.data),

  update: (id: number, data: UpdateSellerCarRequest) =>
    api.patch<Car>(`/seller/cars/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    api
      .delete<{ status: string }>(`/seller/cars/${id}`)
      .then((r) => r.data),
}
