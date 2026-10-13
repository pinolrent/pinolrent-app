import { useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminNotificationRow } from '@/components/admin-rows'
import { AdminListFooter, FilterPills } from '@/components/admin-list'
import { AppButton, EmptyState, ErrorState } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
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
  const colors = useThemeColors()
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

  const applyFilters = () => {
    const parsed = Number(userId.trim())
    setFilters({
      kind: kind || undefined,
      user_id:
        userId.trim() && Number.isFinite(parsed) ? parsed : undefined,
      unread: unreadOnly || undefined,
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
        <View className="rounded-xl border border-border bg-card shadow-xs">
          <View className={isPhone ? 'gap-3 p-3' : 'flex-row items-end gap-3 p-3'}>
            <View className="flex-1">
              <AppInput
                label="Cuenta (id)"
                placeholder="Ej. 3"
                keyboardType="number-pad"
                value={userId}
                onChangeText={setUserId}
                onSubmitEditing={applyFilters}
              />
            </View>
            <AppButton onPress={applyFilters}>Filtrar</AppButton>
          </View>
          <FilterPills
            label="Filtrar por evento"
            options={KIND_OPTIONS}
            value={kind}
            onChange={(next) => {
              setKind(next)
              applyFilters()
            }}
          />
          <FilterPills
            label="Filtrar por lectura"
            options={UNREAD_OPTIONS}
            value={unreadOnly ? 'unread' : ''}
            onChange={(next) => {
              setUnreadOnly(next === 'unread')
              applyFilters()
            }}
          />
        </View>
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
              <View className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <AdminNotificationRow
                  notification={item}
                  last={index === entries.length - 1}
                />
              </View>
            </StaggerCard>
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
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) loadMore()
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState message="No hay notificaciones con ese filtro" />
          }
          ListFooterComponent={
            <AdminListFooter
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
