import { useEffect, useMemo, useState } from 'react'
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCars } from '@/hooks/useCars'
import type { Car, CarsListParams } from '@/types/car'
import { getApiErrorMessage } from '@/utils/errors'
import { formatDate, validateDateRangeInput } from '@/utils/dates'
import { StaggerCard } from '@/components/StaggerCard'
import { SkeletonRow } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { CarListRow } from '@/components/rows'
import { ScreenShell } from '@/components/ScreenShell'
import {
  AppButton,
  AppCard,
  EmptyState,
  ErrorState,
  FormError,
  ListGroup,
} from '@/components/ui-kit'
import { DateField } from '@/components/DateField'

const PAGE_SIZE = 10

export default function CatalogScreen() {
  const router = useRouter()
  const { isPhone } = useBreakpoints()
  const colors = useThemeColors()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startFilterError, setStartFilterError] = useState<string | null>(null)
  const [endFilterError, setEndFilterError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CarsListParams>({})

  // La búsqueda del inicio llega con fechas: se aplican al abrir.
  const params = useLocalSearchParams<{
    start_date?: string
    end_date?: string
  }>()
  useEffect(() => {
    if (!params.start_date || !params.end_date) return
    setStartDate(params.start_date)
    setEndDate(params.end_date)
    setStartFilterError(null)
    setEndFilterError(null)
    setFilters({
      start_date: params.start_date,
      end_date: params.end_date,
    })
  }, [params.start_date, params.end_date])
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
  } = useCars(PAGE_SIZE, filters)

  const cars = data?.pages.flatMap((page) => page) ?? []
  const filtered = Boolean(filters.start_date && filters.end_date)
  const today = useMemo(() => new Date(), [])
  const loadNextPage = () => {
    void fetchNextPage()
  }

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
    const { startError: nextStart, endError: nextEnd } = validateDateRangeInput(
      start,
      end
    )
    setStartFilterError(nextStart)
    setEndFilterError(nextEnd)
    if (nextStart || nextEnd) return
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
    cars.length === 1 ? 'auto mostrado' : 'autos mostrados'
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
    <ScreenShell
      title="Autos disponibles"
      subtitle={isLoading ? undefined : subtitle}
    >
      <AppCard>
        <View className={isPhone ? 'gap-3' : 'flex-row items-end gap-3'}>
          <View className={isPhone ? 'flex-row gap-3' : 'w-44'}>
            <View className="flex-1">
              <DateField
                label="Desde"
                value={startDate}
                onChange={changeStart}
                error={startFilterError}
                minimumDate={today}
              />
            </View>
            {isPhone && (
              <View className="flex-1">
                <DateField
                  label="Hasta"
                  value={endDate}
                  onChange={changeEnd}
                  error={endFilterError}
                  minimumDate={today}
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
                minimumDate={today}
              />
            </View>
          )}
          <View className="flex-row gap-2">
            <AppButton
              className={isPhone ? 'flex-1' : undefined}
              onPress={applyFilters}
            >
              Filtrar
            </AppButton>
            <AppButton
              className={isPhone ? 'flex-1' : undefined}
              variant="ghost"
              onPress={clearFilters}
            >
              Limpiar filtros
            </AppButton>
          </View>
        </View>
      </AppCard>
      {isLoading ? (
        <ListGroup fill>
          <View accessible accessibilityRole="progressbar" accessibilityLabel="Cargando el catálogo">
            {[0, 1, 2].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </View>
        </ListGroup>
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <ListGroup fill>
          <FlatList
            className="flex-1"
            data={cars}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ flexGrow: 1 }}
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
              if (hasNextPage && !isFetchingNextPage) loadNextPage()
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
                  <ActivityIndicator
                    accessibilityRole="progressbar"
                    accessibilityLabel="Cargando más autos"
                  />
                </View>
              ) : isFetchNextPageError ? (
                <View className="items-center gap-2 py-4">
                  <FormError message="No pudimos cargar más autos" />
                  <AppButton variant="outline" size="sm" onPress={loadNextPage}>
                    Reintentar
                  </AppButton>
                </View>
              ) : null
            }
          />
        </ListGroup>
      )}
    </ScreenShell>
  )
}
