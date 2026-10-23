import { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAdminCars } from '@/hooks/useAdmin'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminCarRow } from '@/components/admin-rows'
import { ListFooter, FilterPills } from '@/components/admin-list'
import {
  AppButton,
  AppCard,
  EmptyState,
  ErrorState,
  AppRefreshControl,
  CARD_SURFACE,
  SuccessNote,
} from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import type { AdminCarFilters } from '@/types/admin'

const ACTIVE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const

export default function AdminCarsScreen() {
  const router = useRouter()
  const { isPhone } = useBreakpoints()
  const { deleted } = useLocalSearchParams<{ deleted?: string }>()
  const [notice, setNotice] = useTransientNotice()
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<'active' | 'inactive' | ''>('')
  const [filters, setFilters] = useState<AdminCarFilters>({})

  useEffect(() => {
    if (deleted) setNotice('Auto eliminado')
  }, [deleted, setNotice])
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
  } = useAdminCars(filters)

  const cars = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const loadMore = () => {
    void fetchNextPage()
  }

  const applyFilters = (
    nextActive: 'active' | 'inactive' | '' = active
  ) => {
    const q = search.trim()
    setFilters({
      q: q || undefined,
      active:
        nextActive === 'active'
          ? true
          : nextActive === 'inactive'
            ? false
            : undefined,
    })
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar los autos')
    : null

  return (
    <ScreenShell
      title="Autos"
      subtitle={isLoading ? undefined : `${cars.length} de ${total} en total`}
    >
      <View className="pb-3">
        <AppCard>
          <View className={isPhone ? 'gap-3' : 'flex-row items-end gap-3'}>
            <View className="flex-1">
              <AppInput
                label="Buscar"
                placeholder="Nombre o id exacto"
                returnKeyType="search"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => applyFilters()}
              />
            </View>
            <AppButton onPress={() => applyFilters()}>Buscar</AppButton>
          </View>
          <FilterPills
            label="Filtrar por estado"
            options={ACTIVE_OPTIONS}
            value={active}
            onChange={(next) => {
              setActive(next)
              applyFilters(next)
            }}
          />
        </AppCard>
      </View>
      {isLoading ? (
        <SkeletonList count={4} variant="row" label="Cargando los autos" />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <View className="flex-1 gap-3">
          <SuccessNote message={notice} />
          <FlatList
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 16 }}
            data={cars}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <StaggerCard index={index}>
                <View className={`overflow-hidden ${CARD_SURFACE}`}>
                  <AdminCarRow
                    car={item}
                    onPress={() =>
                      router.push(`/(authenticated)/admin/cars/${item.id}`)
                    }
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
            ListEmptyComponent={<EmptyState message="Ningún auto coincide" />}
            ListFooterComponent={
              <ListFooter
                hasNextPage={Boolean(hasNextPage)}
                isFetchingNextPage={isFetchingNextPage}
                isFetchNextPageError={isFetchNextPageError}
                onLoadMore={loadMore}
              />
            }
          />
        </View>
      )}
    </ScreenShell>
  )
}
