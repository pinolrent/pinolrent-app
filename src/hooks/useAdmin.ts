import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import {
  adminService,
  type UpdateAdminCarRequest,
} from '@/services/admin.service'
import { queryKeys } from '@/constants/query-keys'
import type {
  AdminAuditFilters,
  AdminCarFilters,
  AdminNotificationFilters,
  AdminListResponse,
  AdminPaymentFilters,
  AdminReservationFilters,
  AdminUserFilters,
} from '@/types/admin'

const ADMIN_PAGE_SIZE = 20

// Los listados del admin comparten envoltura {items,total}: se pide de a una
// página y se corta cuando lo cargado alcanza el total.
function useAdminList<T>(
  key: readonly unknown[],
  fetchPage: (offset: number) => Promise<AdminListResponse<T>>
) {
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (total, page) => total + page.items.length,
        0
      )
      return loaded < lastPage.total ? loaded : undefined
    },
    refetchOnMount: 'always',
  })
}

function invalidateAdmin(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['admin'] })
}

// Un cambio del admin puede mover lo que ven comprador y vendedor.
function invalidateReservationCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['reservations'] })
  queryClient.invalidateQueries({ queryKey: ['reservations', 'seller'] })
  queryClient.invalidateQueries({ queryKey: ['reservation'] })
  queryClient.invalidateQueries({ queryKey: ['cars'] })
  queryClient.invalidateQueries({ queryKey: ['car'] })
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useAdminList(queryKeys.adminUsers(filters), (offset) =>
    adminService.users({ ...filters, limit: ADMIN_PAGE_SIZE, offset })
  )
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: () => adminService.user(id),
    enabled: Number.isFinite(id),
    refetchOnMount: 'always',
  })
}

export function useSetUserSuspended() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, suspended }: { id: number; suspended: boolean }) =>
      adminService.setUserSuspended(id, suspended),
    onSuccess: () => {
      invalidateAdmin(queryClient)
    },
  })
}

export function useSetUserSeller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, seller }: { id: number; seller: boolean }) =>
      adminService.setUserSeller(id, seller),
    onSuccess: () => {
      invalidateAdmin(queryClient)
    },
  })
}

export function useAdminCars(filters: AdminCarFilters = {}) {
  return useAdminList(queryKeys.adminCars(filters), (offset) =>
    adminService.cars({ ...filters, limit: ADMIN_PAGE_SIZE, offset })
  )
}

export function useUpdateAdminCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdminCarRequest }) =>
      adminService.updateCar(id, data),
    onSuccess: () => {
      invalidateAdmin(queryClient)
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['car'] })
    },
  })
}

export function useDeleteAdminCar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.deleteCar(id),
    onSuccess: () => {
      invalidateAdmin(queryClient)
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['car'] })
    },
  })
}

export function useAdminReservations(filters: AdminReservationFilters = {}) {
  return useAdminList(queryKeys.adminReservations(filters), (offset) =>
    adminService.reservations({ ...filters, limit: ADMIN_PAGE_SIZE, offset })
  )
}

export function useAdminConfirmReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.confirmReservation(id),
    onSuccess: () => {
      invalidateAdmin(queryClient)
      invalidateReservationCaches(queryClient)
    },
  })
}

export function useAdminRequestCorrection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.requestCorrection(id),
    onSuccess: () => {
      invalidateAdmin(queryClient)
      invalidateReservationCaches(queryClient)
    },
  })
}

export function useAdminPayments(filters: AdminPaymentFilters = {}) {
  return useAdminList(queryKeys.adminPayments(filters), (offset) =>
    adminService.payments({ ...filters, limit: ADMIN_PAGE_SIZE, offset })
  )
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: adminService.stats,
    refetchOnMount: 'always',
  })
}

export function useAdminAudit(filters: AdminAuditFilters = {}) {
  return useAdminList(queryKeys.adminAudit(filters), (offset) =>
    adminService.audit({ ...filters, limit: ADMIN_PAGE_SIZE, offset })
  )
}

// Vista de auditoría de notificaciones: cada nota que recibió una cuenta.
export function useAdminNotifications(
  filters: AdminNotificationFilters = {}
) {
  return useAdminList(queryKeys.adminNotifications(filters), (offset) =>
    adminService.notifications({ ...filters, limit: ADMIN_PAGE_SIZE, offset })
  )
}
