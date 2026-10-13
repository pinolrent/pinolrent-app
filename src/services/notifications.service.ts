import api from './api'
import type {
  Notification,
  NotificationFilters,
} from '@/types/notification'

// El listado de notificaciones NO viene con envoltura paginated: el API
// responde un array plano. Axios omite los parámetros en `undefined` pero
// conserva `false`, así que `unread` puede viajar en blanco sin mandar
// `unread=` vacío (que la API rechazaría como "invalid unread").
export const notificationsService = {
  list: (params?: NotificationFilters) =>
    api.get<Notification[]>('/notifications', { params }).then((r) => r.data),

  markRead: (id: number) =>
    api
      .patch<Notification>(`/notifications/${id}/read`)
      .then((r) => r.data),
}
