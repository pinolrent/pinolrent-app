import { useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { useAdminAudit } from '@/hooks/useAdmin'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminAuditRow } from '@/components/admin-rows'
import { ListFooter, FilterPills } from '@/components/admin-list'
import { AppButton, AppCard, EmptyState, ErrorState } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import {
  ADMIN_ACTIONS,
  type AdminAction,
  type AdminAuditFilters,
} from '@/types/admin'
import { AUDIT_ACTION_LABELS } from '@/constants/admin-ui'

const ACTION_OPTIONS: { value: AdminAction | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  ...ADMIN_ACTIONS.map((action) => ({
    value: action,
    label: AUDIT_ACTION_LABELS[action],
  })),
]

export default function AdminAuditScreen() {
  const colors = useThemeColors()
  const { isPhone } = useBreakpoints()
  const [action, setAction] = useState<AdminAction | ''>('')
  const [actorId, setActorId] = useState('')
  const [filters, setFilters] = useState<AdminAuditFilters>({})
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
  } = useAdminAudit(filters)

  const entries = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const loadMore = () => {
    void fetchNextPage()
  }

  const applyFilters = (
    nextAction: AdminAction | '' = action,
    nextActor: string = actorId
  ) => {
    const parsed = Number(nextActor.trim())
    setFilters({
      action: nextAction || undefined,
      actor_id: nextActor.trim() && Number.isFinite(parsed) ? parsed : undefined,
    })
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar la auditoría')
    : null

  return (
    <ScreenShell
      title="Auditoría"
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
                value={actorId}
                onChangeText={setActorId}
                onSubmitEditing={() => applyFilters()}
              />
            </View>
            <AppButton onPress={() => applyFilters()}>Filtrar</AppButton>
          </View>
          <FilterPills
            label="Filtrar por acción"
            options={ACTION_OPTIONS}
            value={action}
            onChange={(next) => {
              setAction(next)
              applyFilters(next)
            }}
          />
        </AppCard>
      </View>
      {isLoading ? (
        <SkeletonList count={4} variant="row" label="Cargando la auditoría" />
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
                <AdminAuditRow entry={item} />
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
            <EmptyState message="No hay movimientos con ese filtro" />
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
