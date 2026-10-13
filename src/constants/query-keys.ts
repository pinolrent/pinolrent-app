export const queryKeys = {
  cars: (limit?: number, filters?: object) =>
    ['cars', { limit, ...filters }] as const,
  car: (id: number) => ['car', id] as const,
  reservations: (limit?: number) => ['reservations', { limit }] as const,
  sellerReservations: (limit?: number) =>
    ['reservations', 'seller', { limit }] as const,
  sellerCars: (limit?: number) => ['seller-cars', { limit }] as const,
  reservation: (id: number) => ['reservation', id] as const,
  notifications: (filters?: object) =>
    ['notifications', { ...filters }] as const,
  adminUsers: (filters?: object) => ['admin', 'users', { ...filters }] as const,
  adminUser: (id: number) => ['admin', 'user', id] as const,
  adminCars: (filters?: object) => ['admin', 'cars', { ...filters }] as const,
  adminReservations: (filters?: object) =>
    ['admin', 'reservations', { ...filters }] as const,
  adminPayments: (filters?: object) =>
    ['admin', 'payments', { ...filters }] as const,
  adminStats: ['admin', 'stats'] as const,
  adminAudit: (filters?: object) => ['admin', 'audit', { ...filters }] as const,
  adminNotifications: (filters?: object) =>
    ['admin', 'notifications', { ...filters }] as const,
}
