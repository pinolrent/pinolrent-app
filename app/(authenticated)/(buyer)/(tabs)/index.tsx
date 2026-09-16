import { Pressable, Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { useMyReservations } from '@/hooks/useReservations'
import { useCars } from '@/hooks/useCars'
import { getApiErrorMessage } from '@/utils/errors'
import { formatPrice } from '@/utils/currency'
import { formatDateRange, formatDays, toISO } from '@/utils/dates'
import { reservationTotal } from '@/utils/reservations'
import { AppButton, AppCard, EmptyState, ErrorState, ListGroup } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { CarListRow } from '@/components/rows'
import { ScreenShell } from '@/components/ScreenShell'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'

const PREVIEW_CARS = 3

export default function BuyerHomeScreen() {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()
  const carsQuery = useCars(PREVIEW_CARS)

  const loadError = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const reservations = data ?? []
  const today = toISO(new Date())
  const upcoming = reservations
    .filter((r) => r.status !== 'cancelled' && r.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]

  const available =
    carsQuery.data?.pages.flatMap((page) => page).slice(0, PREVIEW_CARS) ?? []
  const upcomingTotals = upcoming
    ? reservationTotal(
        upcoming.start_date,
        upcoming.end_date,
        upcoming.car.price_per_day
      )
    : { days: 0, total: 0 }

  return (
    <ScreenShell title="Inicio" width="form">
      {isLoading ? (
        <SkeletonList count={3} variant="row" />
      ) : loadError ? (
        <ErrorState
          message={loadError}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : (
        <View className="gap-6">
          <View className="gap-2">
            {upcoming ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver la reserva de ${upcoming.car.name}`}
                onPress={() =>
                  router.push(
                    `/(authenticated)/(buyer)/reservations/${upcoming.id}`
                  )
                }
                style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
              >
                <AppCard>
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="text-sm text-muted-foreground">
                      Tu próxima reserva
                    </Text>
                    <StatusBadge tone={STATUS_TONES[upcoming.status]}>
                      {STATUS_LABELS[upcoming.status]}
                    </StatusBadge>
                  </View>
                  <Text className="text-base font-semibold text-foreground">
                    {upcoming.car.name}
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatDateRange(upcoming.start_date, upcoming.end_date)} ·{' '}
                    {formatDays(upcomingTotals.days)}
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatPrice(upcomingTotals.total)}
                  </Text>
                </AppCard>
              </Pressable>
            ) : (
              <AppCard className="items-start">
                <Text className="text-base font-semibold text-foreground">
                  No tienes reservas por delante
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Elige un auto y reserva tus fechas
                </Text>
                <AppButton
                  onPress={() =>
                    router.push('/(authenticated)/(buyer)/catalog')
                  }
                >
                  Explorar autos
                </AppButton>
              </AppCard>
            )}
          </View>

          {carsQuery.isError ? (
            <ErrorState
              message={getApiErrorMessage(
                carsQuery.error,
                'Error al cargar los autos disponibles'
              )}
              onRetry={() => carsQuery.refetch()}
              retrying={carsQuery.isRefetching}
            />
          ) : available.length > 0 ? (
            <ListGroup title="Autos disponibles">
              {available.map((car, index) => (
                <CarListRow
                  key={car.id}
                  car={car}
                  last={index === available.length - 1}
                  onPress={() =>
                    router.push(`/(authenticated)/(buyer)/car/${car.id}`)
                  }
                />
              ))}
            </ListGroup>
          ) : (
            <EmptyState message="Todavía no hay autos disponibles" />
          )}
        </View>
      )}
    </ScreenShell>
  )
}
