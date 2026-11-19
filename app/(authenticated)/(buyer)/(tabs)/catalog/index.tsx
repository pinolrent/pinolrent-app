import { useEffect, useState } from 'react'
import { View, FlatList, Text } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCars } from '@/hooks/useCars'
import type { Car, CarsListParams } from '@/types/car'
import { getApiErrorMessage } from '@/utils/errors'
import { formatDate, todayDate, validateDateRangeInput } from '@/utils/dates'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { CarListRow } from '@/components/rows'
import { ScreenShell } from '@/components/ScreenShell'
import {
  AppButton,
  AppCard,
  AppPressable,
  EmptyState,
  ErrorState,
  ListGroup,
  AppRefreshControl,
  CARD_SURFACE,
} from '@/components/ui-kit'
import { ListFooter } from '@/components/admin-list'
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
  // Con fechas puestas, el formulario se pliega a una barra: el catálogo ya
  // muestra el rango en el subtítulo y un formulario abierto le robaba el
  // primer cuarto de la pantalla a la lista.
  const [datesOpen, setDatesOpen] = useState(true)

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
    setDatesOpen(false)
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
  const today = todayDate()
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
    setDatesOpen(false)
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setStartFilterError(null)
    setEndFilterError(null)
    setFilters({})
    setDatesOpen(false)
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
    <CarListRow
      car={item}
      first={index === 0}
      last={index === cars.length - 1}
      onPress={() => router.push(`/(authenticated)/(buyer)/car/${item.id}`)}
    />
  )

  return (
    <ScreenShell
      title="Autos disponibles"
      subtitle={isLoading ? undefined : subtitle}
    >
      {datesOpen ? (
        <AppCard>
          <View className={isPhone ? 'gap-3' : 'flex-row items-end gap-3'}>
            <View className={isPhone ? 'gap-3' : 'flex-row gap-3'}>
              <View className={isPhone ? undefined : 'w-44'}>
                <DateField
                  label="Desde"
                  value={startDate}
                  onChange={changeStart}
                  error={startFilterError}
                  minimumDate={today}
                />
              </View>
              <View className={isPhone ? undefined : 'w-44'}>
                <DateField
                  label="Hasta"
                  value={endDate}
                  onChange={changeEnd}
                  error={endFilterError}
                  minimumDate={today}
                />
              </View>
            </View>
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
      ) : (
        <View
          className={`flex-row items-center justify-between gap-3 px-4 py-1 ${CARD_SURFACE}`}
        >
          <Text numberOfLines={1} className="flex-1 text-sm text-muted-foreground">
            {filtered
              ? `Del ${formatDate(filters.start_date!)} al ${formatDate(filters.end_date!)}`
              : 'Sin filtro de fechas'}
          </Text>
          <View className="flex-row items-center gap-2">
            {filtered ? (
              <AppPressable
                accessibilityRole="button"
                accessibilityLabel="Quitar el filtro de fechas"
                onPress={clearFilters}
                hoverClassName="underline"
                className="min-h-11 justify-center px-1"
              >
                <Text className="text-sm text-primary">Limpiar</Text>
              </AppPressable>
            ) : null}
            <AppPressable
              accessibilityRole="button"
              accessibilityLabel={filtered ? 'Cambiar fechas' : 'Elegir fechas'}
              onPress={() => setDatesOpen(true)}
              hoverClassName="underline"
              className="min-h-11 justify-center px-1"
            >
              <Text className="text-sm font-semibold text-primary">
                {filtered ? 'Cambiar fechas' : 'Elegir fechas'}
              </Text>
            </AppPressable>
          </View>
        </View>
      )}
      {isLoading ? (
        <ListGroup fill>
          <SkeletonList count={3} variant="row" label="Cargando el catálogo" />
        </ListGroup>
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <ListGroup fill bordered={false}>
          <FlatList
            className="flex-1"
            data={cars}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <AppRefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
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
              />
            }
            ListFooterComponent={
              <ListFooter
                hasNextPage={Boolean(hasNextPage)}
                isFetchingNextPage={isFetchingNextPage}
                isFetchNextPageError={isFetchNextPageError}
                onLoadMore={loadNextPage}
              />
            }
          />
        </ListGroup>
      )}
    </ScreenShell>
  )
}
