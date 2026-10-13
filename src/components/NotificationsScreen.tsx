import { useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import type { Notification } from '@/types/notification'
import { getApiErrorMessage } from '@/utils/errors'
import {
  isNotificationNavigable,
  notificationTarget,
  type NotificationArea,
} from '@/utils/notifications'
import { ScreenShell } from '@/components/ScreenShell'
import { NotificationRow } from '@/components/rows'
import {
  AppButton,
  EmptyState,
  ErrorState,
  FormError,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { FilterPills } from '@/components/admin-list'
import { useThemeColors } from '@/hooks/useThemeColors'

const READ_FILTERS: { value: 'unread' | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'unread', label: 'Sin leer' },
]

export default function NotificationsScreen({ area }: { area: NotificationArea }) {
  const router = useRouter()
  const colors = useThemeColors()
  const [readFilter, setReadFilter] = useState<'unread' | ''>('')
  const filters = readFilter === 'unread' ? { unread: true } : {}
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useNotifications(filters)
  const markRead = useMarkNotificationRead()
  const [readError, setReadError] = useTransientNotice()

  const notifications = data ?? []
  const unread = notifications.filter((n) => !n.read).length
  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las notificaciones')
    : null

  const onRowPress = (n: Notification) => {
    if (!n.read) {
      markRead.mutate(n.id, {
        onError: () => setReadError('No pudimos marcarla como leída'),
      })
    }
    const target = notificationTarget(n.kind, area, n.reservation_id)
    if (target) router.push(target)
  }

  return (
    <ScreenShell
      title="Notificaciones"
      subtitle={
        isLoading
          ? undefined
          : notifications.length === 0
            ? undefined
            : unread > 0
              ? `${unread} sin leer`
              : 'Al día'
      }
    >
      <View className="pb-3">
        <FilterPills
          label="Filtrar por lectura"
          options={READ_FILTERS}
          value={readFilter}
          onChange={(v) => setReadFilter(v)}
        />
      </View>
      <FormError message={readError} />
      {isLoading ? (
        <SkeletonList
          count={5}
          variant="row"
          label="Cargando las notificaciones"
        />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 16 }}
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <NotificationRow
              notification={item}
              last={index === notifications.length - 1}
              onPress={
                isNotificationNavigable(item.kind, area)
                  ? () => onRowPress(item)
                  : undefined
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.card}
            />
          }
          ListEmptyComponent={
            <EmptyState
              message={
                readFilter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No tienes notificaciones'
              }
              action={
                <AppButton onPress={() => refetch()}>Recargar</AppButton>
              }
            />
          }
        />
      )}
    </ScreenShell>
  )
}
