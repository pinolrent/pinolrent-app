export const queryKeys = {
  cars: (limit?: number, filters?: object) => ['cars', { limit, ...filters }] as const,
  car: (id: number) => ['car', id] as const,
  reservations: ['reservations'] as const,
  sellerReservations: ['reservations', 'seller'] as const,
  sellerCars: ['seller-cars'] as const,
  reservation: (id: number) => ['reservation', id] as const,
}
