import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services/notifications.service'
import { queryKeys } from '@/constants/query-keys'
import type { NotificationFilters } from '@/types/notification'

// La API no hace push: el cliente sondea la banda de no leídas. 30 s es
// suficiente para que el badge se mantenga actual sin saturar al servidor.
export const UNREAD_POLL_MS = 30_000

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.notifications(filters),
    queryFn: () => notificationsService.list(filters),
    refetchOnMount: 'always',
  })
}

// Única query con refetch activo: la usan los layouts (badge) y el filtro
// "Sin leer" comparte caché porque el key es idéntico.
export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications({ unread: true }),
    queryFn: () => notificationsService.list({ unread: true }),
    refetchOnMount: 'always',
    refetchInterval: UNREAD_POLL_MS,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
