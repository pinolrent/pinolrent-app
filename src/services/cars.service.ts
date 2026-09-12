import api from './api'
import type { Car, CarsListParams } from '@/types/car'

export const carsService = {
  list: (params?: CarsListParams) =>
    api.get<Car[]>('/cars', { params }).then((r) => r.data),

  get: (id: number) => api.get<Car>(`/cars/${id}`).then((r) => r.data),

  contact: (id: number) =>
    api
      .get<{ whatsapp_url: string }>(`/cars/${id}/contact`)
      .then((r) => r.data),
}