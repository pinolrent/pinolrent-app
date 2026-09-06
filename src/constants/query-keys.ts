export const queryKeys = {
  cars: (limit?: number) => ['cars', { limit }] as const,
  car: (id: number) => ['car', id] as const,
  reservations: ['reservations'] as const,
  sellerReservations: ['reservations', 'seller'] as const,
  sellerCars: ['seller-cars'] as const,
}
