import type { Car } from './car'
import type { Payment } from './payment'

export interface Reservation {
  id: number
  user_id: number
  car_id: number
  start_date: string
  end_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
  car: Car
  payment?: Payment
}

export interface CreateReservationRequest {
  car_id: number
  start_date: string
  end_date: string
}
