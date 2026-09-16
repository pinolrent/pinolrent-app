import { useState } from 'react'
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useCars } from '@/hooks/useCars'
import type { Car, CarsListParams } from '@/types/car'
import { getApiErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/dates'
import { StaggerCard } from '@/components/StaggerCard'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { CarListRow } from '@/components/rows'
import { ScreenShell } from '@/components/ScreenShell'
import { isValidISODate } from '@/utils/dates'
import { AppButton, AppCard, EmptyState, ErrorState, FormError } from '@/components/ui-kit'
import { DateField } from '@/components/DateField'

const PAGE_SIZE = 10

export default function CatalogScreen() {
  const router = useRouter()
  const { isPhone } = useBreakpoints()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startFilterError, setStartFilterError] = useState<string | null>(null)
  const [endFilterError, setEndFilterError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CarsListParams>({})
  const { data, isLoading, isError, error, refetch, isRefetching, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useCars(PAGE_SIZE, filters)

  const cars = data?.pages.flatMap((page) => page) ?? []
  const filtered = Boolean(filters.start_date && filters.end_date)
  const retryNextPage = () => fetchNextPage()

  const changeStart = (v: string) => {
    setStartDate(v)
    setStartFilterError(null)
  }

  const changeEnd = (v: string) => {
    setEndDate(v)
    setEndFilterError(null)
  }

  const applyFilters = () => {
    const start = startDate.trim()
    const end = endDate.trim()
    setStartFilterError(null)
    setEndFilterError(null)
    if (start && !isValidISODate(start)) {
      setStartFilterError('Selecciona una fecha válida')
      return
    }
    if (end && !isValidISODate(end)) {
      setEndFilterError('Selecciona una fecha válida')
      return
    }
    if (start && !end) {
      setEndFilterError('Elige también la fecha de fin')
      return
    }
    if (!start && end) {
      setStartFilterError('Elige también la fecha de inicio')
      return
    }
    if (start && end && end < start) {
      setEndFilterError('La fecha de fin tiene que ser posterior a la de inicio')
      return
    }
    setFilters(start && end ? { start_date: start, end_date: end } : {})
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setStartFilterError(null)
    setEndFilterError(null)
    setFilters({})
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el catálogo')
    : null

  const countLabel = `${cars.length} ${
    cars.length === 1 ? 'auto publicado' : 'autos publicados'
  }`
  const subtitle = filtered
    ? `${cars.length} ${cars.length === 1 ? 'resultado' : 'resultados'} · ${formatDate(filters.start_date!)} → ${formatDate(filters.end_date!)}`
    : countLabel

  const renderItem = ({ item, index }: { item: Car; index: number }) => (
    <StaggerCard index={index}>
      <CarListRow
        car={item}
        last={index === cars.length - 1}
        onPress={() => router.push(`/(authenticated)/(buyer)/car/${item.id}`)}
      />
    </StaggerCard>
  )

  return (
    <ScreenShell title="Autos disponibles" subtitle={isLoading ? undefined : subtitle}>
      {isLoading ? (
        <SkeletonList count={4} variant="row" />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : (
        <>
          <AppCard>
            <View className={isPhone ? 'gap-3' : 'flex-row items-end gap-3'}>
              <View className={isPhone ? 'flex-row gap-3' : 'w-44'}>
                <View className="flex-1">
                  <DateField
                    label="Desde"
                    value={startDate}
                    onChange={changeStart}
                    error={startFilterError}
                  />
                </View>
                {isPhone && (
                  <View className="flex-1">
                    <DateField
                      label="Hasta"
                      value={endDate}
                      onChange={changeEnd}
                      error={endFilterError}
                    />
                  </View>
                )}
              </View>
              {!isPhone && (
                <View className="w-44">
                  <DateField
                    label="Hasta"
                    value={endDate}
                    onChange={changeEnd}
                    error={endFilterError}
                  />
                </View>
              )}
              <View className="flex-row gap-2">
                <AppButton onPress={applyFilters}>Filtrar</AppButton>
                <AppButton variant="ghost" onPress={clearFilters}>
                  Limpiar filtros
                </AppButton>
              </View>
            </View>
          </AppCard>
          <View className="flex-1">
            <FlatList
              className="flex-1"
              data={cars}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={() => refetch()}
                />
              }
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
              }}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                <EmptyState
                  message={
                    filtered
                      ? 'Ningún auto libre en esas fechas'
                      : 'Todavía no hay autos publicados'
                  }
                  action={
                    filtered ? (
                      <AppButton variant="outline" onPress={clearFilters}>
                        Limpiar filtros
                      </AppButton>
                    ) : null
                  }
                />
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4">
                    <ActivityIndicator accessibilityLabel="Cargando más autos" />
                  </View>
                ) : isFetchNextPageError ? (
                  <View className="items-center gap-2 py-4">
                    <FormError message="No pudimos cargar más autos" />
                    <AppButton
                      variant="outline"
                      size="sm"
                      onPress={retryNextPage}
                    >
                      Reintentar
                    </AppButton>
                  </View>
                ) : null
              }
            />
          </View>
        </>
      )}
    </ScreenShell>
  )
}
