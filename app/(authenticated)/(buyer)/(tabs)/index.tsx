import { useState } from 'react'
import { Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useMyReservations } from '@/hooks/useReservations'
import { useCars } from '@/hooks/useCars'
import { getApiErrorMessage } from '@/utils/errors'
import { formatPrice } from '@/utils/currency'
import {
  formatDateRange,
  formatDays,
  toISO,
  validateDateRangeInput,
} from '@/utils/dates'
import { reservationPricing } from '@/utils/reservations'
import {
  AppButton,
  AppCard,
  AppPressable,
  EmptyState,
  ErrorState,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { CarCard } from '@/components/rows'
import { DateField } from '@/components/DateField'
import { ScreenShell } from '@/components/ScreenShell'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { NUMERIC, SECTION_LABEL } from '@/constants/typography'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'

const PREVIEW_CARS = 3

export default function BuyerHomeScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { columns, isWide } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()
  const carsQuery = useCars(PREVIEW_CARS)

  // La búsqueda del inicio es de verdad: las fechas viajan al catálogo.
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [startError, setStartError] = useState<string | null>(null)
  const [endError, setEndError] = useState<string | null>(null)
  const today = new Date()

  const onSearch = () => {
    const from = start.trim()
    const to = end.trim()
    const { startError: nextStart, endError: nextEnd } = validateDateRangeInput(
      from,
      to
    )
    setStartError(nextStart)
    setEndError(nextEnd)
    if (nextStart || nextEnd) return
    if (!from && !to) {
      router.push('/(authenticated)/(buyer)/catalog')
      return
    }
    router.push({
      pathname: '/(authenticated)/(buyer)/catalog',
      params: { start_date: from, end_date: to },
    })
  }

  const loadError = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const reservations = data ?? []
  const todayISO = toISO(today)
  const upcoming = reservations
    .filter((r) => r.status !== 'cancelled' && r.end_date >= todayISO)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]

  const available =
    carsQuery.data?.pages.flatMap((page) => page).slice(0, PREVIEW_CARS) ?? []
  const upcomingPricing = upcoming
    ? reservationPricing(
        upcoming.start_date,
        upcoming.end_date,
        upcoming.car.price_per_day
      )
    : null

  const gridItem =
    columns === 3 ? 'min-w-[280px]' : columns === 2 ? 'min-w-[240px]' : ''

  return (
    <ScreenShell title="Inicio" width={isWide ? 'default' : 'form'} scroll>
      <View className="gap-6">
        <AppCard gap="md">
          <View className="gap-1">
            <Text className="text-lg font-bold text-foreground">
              Buscar un auto
            </Text>
            <Text className="text-sm text-muted-foreground">
              Elegí tus fechas y mirá qué hay libre
            </Text>
          </View>
          <View className={isWide ? 'flex-row items-end gap-3' : 'gap-3'}>
            <View className={isWide ? 'flex-1 flex-row gap-3' : 'gap-3'}>
              <View className={isWide ? 'flex-1' : undefined}>
                <DateField
                  label="Desde"
                  value={start}
                  onChange={(v) => {
                    setStart(v)
                    setStartError(null)
                  }}
                  error={startError}
                  minimumDate={today}
                />
              </View>
              <View className={isWide ? 'flex-1' : undefined}>
                <DateField
                  label="Hasta"
                  value={end}
                  onChange={(v) => {
                    setEnd(v)
                    setEndError(null)
                  }}
                  error={endError}
                  minimumDate={today}
                />
              </View>
            </View>
            <AppButton onPress={onSearch}>Buscar autos</AppButton>
          </View>
        </AppCard>

        {isLoading ? (
          <SkeletonList count={1} label="Cargando tus reservas" />
        ) : loadError ? (
          <ErrorState
            message={loadError}
            onRetry={() => refetch()}
            retrying={isRefetching}
          />
        ) : upcoming && upcomingPricing ? (
          <View className="gap-2">
            <Text
              accessibilityRole="header"
              style={SECTION_LABEL}
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Tu próxima reserva
            </Text>
            <AppPressable
              accessibilityRole="button"
              accessibilityLabel={`Ver la reserva de ${upcoming.car.name}`}
              onPress={() =>
                router.push(
                  `/(authenticated)/(buyer)/reservations/${upcoming.id}`
                )
              }
              hoverClassName="border-primary/40"
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <StatusBadge tone={STATUS_TONES[upcoming.status]}>
                    {STATUS_LABELS[upcoming.status]}
                  </StatusBadge>
                  <Text
                    numberOfLines={1}
                    className="flex-1 text-base font-semibold text-foreground"
                  >
                    {upcoming.car.name}
                  </Text>
                </View>
                <Text style={NUMERIC} className="text-sm text-muted-foreground">
                  {formatDateRange(upcoming.start_date, upcoming.end_date)} ·{' '}
                  {formatDays(upcomingPricing.days)} ·{' '}
                  {formatPrice(upcomingPricing.buyerTotal)}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.mutedText} />
            </AppPressable>
          </View>
        ) : null}

        {carsQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(
              carsQuery.error,
              'Error al cargar los autos disponibles'
            )}
            onRetry={() => carsQuery.refetch()}
            retrying={carsQuery.isRefetching}
          />
        ) : carsQuery.isLoading ? (
          <SkeletonList
            count={PREVIEW_CARS}
            label="Cargando los autos disponibles"
          />
        ) : available.length > 0 ? (
          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <Text
                accessibilityRole="header"
                style={SECTION_LABEL}
                className="px-1 text-xs font-semibold uppercase text-muted-foreground"
              >
                Autos disponibles
              </Text>
              <AppPressable
                accessibilityRole="link"
                accessibilityLabel="Ver el catálogo completo"
                onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
                hoverClassName="underline"
                className="min-h-11 justify-center px-1"
              >
                <Text className="text-sm text-primary">Ver catálogo</Text>
              </AppPressable>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {available.map((car, index) => (
                <StaggerCard key={car.id} index={index} className={gridItem}>
                  <CarCard
                    car={car}
                    onPress={() =>
                      router.push(`/(authenticated)/(buyer)/car/${car.id}`)
                    }
                  />
                </StaggerCard>
              ))}
            </View>
          </View>
        ) : (
          <EmptyState
            message="Todavía no hay autos disponibles"
            action={
              <AppButton
                variant="outline"
                onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
              >
                Explorar el catálogo
              </AppButton>
            }
          />
        )}
      </View>
    </ScreenShell>
  )
}
