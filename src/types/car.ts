export interface Car {
  id: number
  owner_id: number
  name: string
  photo_url?: string
  price_per_day: number
  active: boolean
}

export interface CarsListParams {
  limit?: number
  offset?: number
  start_date?: string
  end_date?: string
  owner_id?: number
}
