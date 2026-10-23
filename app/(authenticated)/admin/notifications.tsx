import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminNotificationRow } from '@/components/admin-rows'
import { ListFooter, FilterPills } from '@/components/admin-list'
import {
  AppButton,
  AppCard,
  AppRefreshControl,
  CARD_SURFACE,
  EmptyState,
  ErrorState,
} from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useAdminNotifications } from '@/hooks/useAdmin'
import { NOTIFICATION_LABELS } from '@/constants/notification-ui'
import { NOTIFICATION_KINDS } from '@/types/notification'
import type { NotificationKind } from '@/types/notification'
import type { AdminNotificationFilters } from '@/types/admin'

const KIND_OPTIONS: { value: NotificationKind | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  ...NOTIFICATION_KINDS.map((kind) => ({
    value: kind as NotificationKind,
    label: NOTIFICATION_LABELS[kind as NotificationKind],
  })),
]

const UNREAD_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'unread', label: 'Sin leer' },
] as const

export default function AdminNotificationsScreen() {
  const { isPhone } = useBreakpoints()
  const [kind, setKind] = useState<NotificationKind | ''>('')
  const [userId, setUserId] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [filters, setFilters] = useState<AdminNotificationFilters>({})

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useAdminNotifications(filters)

  const entries = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  const applyFilters = (next: {
    kind?: NotificationKind | ''
    unread?: boolean
  } = {}) => {
    const parsed = Number(userId.trim())
    setFilters({
      kind: (next.kind ?? kind) || undefined,
      user_id:
        userId.trim() && Number.isFinite(parsed) ? parsed : undefined,
      unread: (next.unread ?? unreadOnly) || undefined,
    })
  }

  const loadMore = () => {
    void fetchNextPage()
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las notificaciones')
    : null

  return (
    <ScreenShell
      title="Notificaciones"
      subtitle={isLoading ? undefined : `${entries.length} de ${total} en total`}
    >
      <View className="pb-3">
        <AppCard>
          <View className={isPhone ? 'gap-3' : 'flex-row items-end gap-3'}>
            <View className="flex-1">
              <AppInput
                label="Cuenta (id)"
                placeholder="Ej. 3"
                keyboardType="number-pad"
                value={userId}
                onChangeText={setUserId}
                onSubmitEditing={() => applyFilters()}
              />
            </View>
            <AppButton onPress={() => applyFilters()}>Filtrar</AppButton>
          </View>
          <FilterPills
            label="Filtrar por evento"
            options={KIND_OPTIONS}
            value={kind}
            onChange={(next) => {
              setKind(next)
              applyFilters({ kind: next })
            }}
          />
          <FilterPills
            label="Filtrar por lectura"
            options={UNREAD_OPTIONS}
            value={unreadOnly ? 'unread' : ''}
            onChange={(next) => {
              setUnreadOnly(next === 'unread')
              applyFilters({ unread: next === 'unread' })
            }}
          />
        </AppCard>
      </View>
      {isLoading ? (
        <SkeletonList
          count={4}
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
          data={entries}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <StaggerCard index={index}>
              <View className={`overflow-hidden ${CARD_SURFACE}`}>
                <AdminNotificationRow
                  notification={item}
                  last={index === entries.length - 1}
                />
              </View>
            </StaggerCard>
          )}
          refreshControl={
            <AppRefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) loadMore()
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState message="No hay notificaciones con ese filtro" />
          }
          ListFooterComponent={
            <ListFooter
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              isFetchNextPageError={isFetchNextPageError}
              onLoadMore={loadMore}
            />
          }
        />
      )}
    </ScreenShell>
  )
}
