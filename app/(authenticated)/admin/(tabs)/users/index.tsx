import { useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAdminUsers } from '@/hooks/useAdmin'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminUserRow } from '@/components/admin-rows'
import { ListFooter, FilterPills } from '@/components/admin-list'
import { AppButton, AppCard, EmptyState, ErrorState } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { ROLE_LABELS } from '@/constants/admin-ui'
import type { Role } from '@/types/auth'
import type { AdminUserFilters } from '@/types/admin'

const ROLE_OPTIONS: { value: Role | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  ...(['buyer', 'seller', 'admin'] as const).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })),
]

export default function AdminUsersScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { isPhone } = useBreakpoints()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [filters, setFilters] = useState<AdminUserFilters>({})
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
  } = useAdminUsers(filters)

  const users = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const loadMore = () => {
    void fetchNextPage()
  }

  const applyFilters = () => {
    const q = search.trim()
    setFilters({ q: q || undefined, role: role || undefined })
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las cuentas')
    : null

  return (
    <ScreenShell
      title="Usuarios"
      subtitle={isLoading ? undefined : `${users.length} de ${total} en total`}
    >
      <View className="pb-3">
        <AppCard>
          <View className={isPhone ? 'gap-3' : 'flex-row items-end gap-3'}>
            <View className="flex-1">
              <AppInput
                label="Buscar"
                placeholder="Email o id exacto"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={applyFilters}
              />
            </View>
            <AppButton onPress={applyFilters}>Buscar</AppButton>
          </View>
          <FilterPills
            label="Filtrar por rol"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(next) => {
              setRole(next)
              const q = search.trim()
              setFilters({ q: q || undefined, role: next || undefined })
            }}
          />
        </AppCard>
      </View>
      {isLoading ? (
        <SkeletonList count={4} label="Cargando las cuentas" />
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
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <StaggerCard index={index}>
              <View className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <AdminUserRow
                  user={item}
                  onPress={() =>
                    router.push(`/(authenticated)/admin/users/${item.id}`)
                  }
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
          ListEmptyComponent={<EmptyState message="Ninguna cuenta coincide" />}
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
